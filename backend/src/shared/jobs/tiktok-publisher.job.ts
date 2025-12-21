import { Prisma, TikTokReelStatus } from "@prisma/client";
import prisma from "../lib/prisma";

import { TikTokUploadService } from "../../modules/tiktok/services/tiktok-upload.service";
import { TikTokStatusService } from "../../modules/tiktok/services/tiktok-status.service";
import { TikTokRefreshService } from "../../modules/tiktok/services/tiktok-refresh.service";
import { TikTokCreatorService } from "../../modules/tiktok/services/tiktok-creator.service";

type TikTokReelWithClient =
  Prisma.tiktok_reelsGetPayload<{
    include: {
      client: {
        include: {
          tiktok_account: true;
        };
      };
    };
  }>;

export const processTikTokReels = async () => {
  const now = new Date();

  console.log("⏰ [TikTok JOB] Ejecutando job a las:", now.toISOString());

  // 🔑 CAMBIO CLAVE: buscar SCHEDULED y PROCESSING
  const reels: TikTokReelWithClient[] =
    await prisma.tiktok_reels.findMany({
      where: {
        OR: [
          {
            status: TikTokReelStatus.SCHEDULED,
            scheduled_at: { lte: now },
          },
          {
            status: TikTokReelStatus.PROCESSING,
          },
        ],
      },
      include: {
        client: {
          include: {
            tiktok_account: true,
          },
        },
      },
    });

  console.log(
    `📦 [TikTok JOB] Reels encontrados para procesar: ${reels.length}`
  );

  for (const reel of reels) {
    console.log("────────────────────────────────────");
    console.log("🎬 Procesando reel ID:", reel.id);
    console.log("📄 Datos del reel:", {
      title: [
        reel.title,
        reel.description
      ].filter(Boolean).join("\n\n"),
      status: reel.status,
      video_url: reel.video_url,
      privacy_level: reel.privacy_level,
      scheduled_at: reel.scheduled_at,
      publish_id: reel.publish_id,
    });

    const account = reel.client.tiktok_account;
    if (!account) {
      console.warn("⚠️ No hay cuenta TikTok asociada al cliente");
      continue;
    }

    try {
      /* 1️⃣ Refresh token si es necesario */
      if (account.expires_at <= new Date()) {
        console.log("🔄 Token expirado, refrescando...");

        const refreshed =
          await TikTokRefreshService.refreshToken(
            account.refresh_token
          );

        await prisma.tiktok_account.update({
          where: { id: account.id },
          data: {
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token,
            expires_at: new Date(
              Date.now() + refreshed.expires_in * 1000
            ),
          },
        });

        account.access_token = refreshed.access_token;
        console.log("✅ Token refrescado");
      } else {
        console.log("✅ Token aún válido");
      }

      /* 2️⃣ Creator info (requerido por TikTok) */
      console.log("👤 Consultando creator_info...");
      const creatorInfo =
        await TikTokCreatorService.queryCreatorInfo(
          account.access_token
        );
      console.log("👤 creator_info recibido:", creatorInfo);

      let publishId = reel.publish_id;

      /* 3️⃣ SOLO si está SCHEDULED → initUpload */
      if (reel.status === TikTokReelStatus.SCHEDULED) {
        console.log("⏳ Marcando reel como PROCESSING...");
        await prisma.tiktok_reels.update({
          where: { id: reel.id },
          data: { status: TikTokReelStatus.PROCESSING },
        });

        console.log("🚀 Inicializando publicación en TikTok...");
        const initResponse =
          await TikTokUploadService.initUpload({
            access_token: account.access_token,
            title: [
              reel.title,
              reel.description
            ].filter(Boolean).join("\n\n"),
            video_url: reel.video_url,
            privacy_level: reel.privacy_level,
            allow_comment: reel.allow_comment,
            allow_duet: reel.allow_duet,
            allow_stitch: reel.allow_stitch,
          });

        console.log("📨 Respuesta initUpload:", initResponse);

        if (!initResponse?.publish_id) {
          throw new Error("TikTok no devolvió publish_id");
        }

        publishId = initResponse.publish_id;

        await prisma.tiktok_reels.update({
          where: { id: reel.id },
          data: { publish_id: publishId },
        });

        console.log("🆔 publish_id guardado:", publishId);
      }

      /* 4️⃣ Consultar estado SIEMPRE que exista publish_id */
      if (!publishId) {
        console.warn("⚠️ No hay publish_id, se omite status check");
        continue;
      }

      console.log("🔍 Consultando estado de publicación...");
      const status =
        await TikTokStatusService.getStatus({
          access_token: account.access_token,
          publish_id: publishId,
        });

      console.log("📊 Estado recibido:", status);

      if (
        status.status === "PROCESSING" ||
        status.status === "PROCESSING_DOWNLOAD"
      ) {
        console.log("⏳ TikTok aún procesando, se revisará luego");
        continue;
      }

      if (status.status === "SUCCESS" ||
        status.status === "PUBLISH_COMPLETE"
      ) {
        console.log("✅ Video publicado con éxito");
        await prisma.tiktok_reels.update({
          where: { id: reel.id },
          data: {
            status: TikTokReelStatus.PUBLISHED,
            video_id: status.video_id ?? null,
            published_at: new Date(),
          },
        });
      }

      if (status.status === "FAILED") {
        console.error(
          "❌ TikTok marcó el post como FAILED:",
          status.error_message
        );
        await prisma.tiktok_reels.update({
          where: { id: reel.id },
          data: {
            status: TikTokReelStatus.FAILED,
            error_message:
              status.error_message ??
              "TikTok publish failed",
          },
        });
      }
    } catch (error: any) {
      console.error("🔥 Error durante publicación TikTok");
      console.error(
        error?.response?.data || error?.message || error
      );

      await prisma.tiktok_reels.update({
        where: { id: reel.id },
        data: {
          status: TikTokReelStatus.FAILED,
          error_message:
            error?.response?.data?.error?.message ||
            error?.message ||
            "Unknown TikTok error",
        },
      });
    }
  }

  console.log("🏁 [TikTok JOB] Ejecución finalizada");
};
