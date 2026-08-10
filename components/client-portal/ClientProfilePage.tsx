"use client";

import {
  FormEvent,
  useState,
} from "react";
import {useRouter} from "next/navigation";

import {
  StudioCard,
} from "@/components/studio/StudioDesignSystem";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {
  StudioBadge,
  StudioPageHeader,
  StudioSectionHeader,
} from "@/components/studio/ui/StudioUiPrimitives";
import type {
  ClientPortalProject,
} from "@/lib/client-portal/get-client-portal-context";

type ClientProfile = {
  id: string;
  fullName: string;
  email: string;
};

type Props = {
  project: ClientPortalProject;
  profile: ClientProfile;
};

type Message = {
  tone: "success" | "error";
  text: string;
} | null;

export default function ClientProfilePage({
  project,
  profile,
}: Props) {
  const router = useRouter();

  const [fullName, setFullName] =
    useState(profile.fullName);

  const [
    profileSaving,
    setProfileSaving,
  ] = useState(false);

  const [
    profileMessage,
    setProfileMessage,
  ] = useState<Message>(null);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    newPasswordAgain,
    setNewPasswordAgain,
  ] = useState("");

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState<Message>(null);

  async function saveProfile(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedName =
      fullName.trim();

    if (normalizedName.length < 2) {
      setProfileMessage({
        tone: "error",
        text: "Ad soyad en az 2 karakter olmalıdır.",
      });

      return;
    }

    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const response = await fetch(
        "/api/client/profile",
        {
          method: "PATCH",
          headers: {
            "content-type":
              "application/json",
          },
          body: JSON.stringify({
            fullName: normalizedName,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Profil güncellenemedi.",
        );
      }

      setFullName(
        data.profile?.fullName ??
          normalizedName,
      );

      setProfileMessage({
        tone: "success",
        text: "Profil bilgileriniz güncellendi.",
      });

      /*
       * Layout yeniden render edilir.
       * Header userName değeri de güncellenir.
       */
      router.refresh();
    } catch (error) {
      setProfileMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Profil güncellenemedi.",
      });
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({
        tone: "error",
        text: "Mevcut şifrenizi girin.",
      });

      return;
    }

    if (newPassword.length < 10) {
      setPasswordMessage({
        tone: "error",
        text: "Yeni şifre en az 10 karakter olmalıdır.",
      });

      return;
    }

    if (
      newPassword !==
      newPasswordAgain
    ) {
      setPasswordMessage({
        tone: "error",
        text: "Yeni şifreler eşleşmiyor.",
      });

      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setPasswordMessage({
        tone: "error",
        text: "Yeni şifre mevcut şifreden farklı olmalıdır.",
      });

      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch(
        "/api/client/profile/password",
        {
          method: "POST",
          headers: {
            "content-type":
              "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Şifre değiştirilemedi.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordAgain("");

      setPasswordMessage({
        tone: "success",
        text: "Şifreniz başarıyla değiştirildi.",
      });
    } catch (error) {
      setPasswordMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Şifre değiştirilemedi.",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <StudioPageHeader
        eyebrow={project.name}
        title="Profil"
        description="Hesap bilgilerinizi ve giriş güvenliğinizi yönetin."
        icon="user"
        actions={
          <StudioBadge variant="neutral">
            Müşteri hesabı
          </StudioBadge>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <StudioCard className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <StudioSectionHeader
              title="Kişisel Bilgiler"
              description="Portal üzerinde görünen temel hesap bilgileriniz."
              icon="user"
            />

            <form
              onSubmit={saveProfile}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="client-profile-full-name"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] opacity-55"
                >
                  Ad Soyad
                </label>

                <input
                  id="client-profile-full-name"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value,
                    )
                  }
                  disabled={profileSaving}
                  className="w-full rounded-xl border border-[#E3E9EF] bg-[#F7F9FC] px-4 py-3 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="client-profile-email"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] opacity-55"
                >
                  E-posta
                </label>

                <input
                  id="client-profile-email"
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[#E3E9EF] bg-[#F3F6FA] px-4 py-3 text-sm opacity-65"
                />

                <p className="mt-2 text-xs leading-5 opacity-45">
                  Giriş e-posta adresiniz güvenlik nedeniyle bu ekrandan değiştirilemez.
                </p>
              </div>

              {profileMessage && (
                <div
                  role="status"
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    profileMessage.tone ===
                    "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {
                    profileMessage.text
                  }
                </div>
              )}

              <div className="flex justify-end border-t border-[#E3E9EF] pt-5">
                <button
                  type="submit"
                  disabled={
                    profileSaving
                  }
                  className={studioButtonClass("primary", "md")}
                >
                  {profileSaving
                    ? "Kaydediliyor…"
                    : "Bilgileri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </StudioCard>

        <StudioCard className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <StudioSectionHeader
              title="Şifre ve Güvenlik"
              description="Portal hesabınızın giriş şifresini güvenli şekilde değiştirin."
              icon="user"
            />

            <form
              onSubmit={changePassword}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="client-profile-current-password"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] opacity-55"
                >
                  Mevcut Şifre
                </label>

                <input
                  id="client-profile-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value,
                    )
                  }
                  disabled={passwordSaving}
                  className="w-full rounded-xl border border-[#E3E9EF] bg-[#F7F9FC] px-4 py-3 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="client-profile-new-password"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] opacity-55"
                >
                  Yeni Şifre
                </label>

                <input
                  id="client-profile-new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                  disabled={passwordSaving}
                  className="w-full rounded-xl border border-[#E3E9EF] bg-[#F7F9FC] px-4 py-3 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs leading-5 opacity-45">
                  En az 10 karakter kullanın.
                </p>
              </div>

              <div>
                <label
                  htmlFor="client-profile-new-password-again"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] opacity-55"
                >
                  Yeni Şifre Tekrar
                </label>

                <input
                  id="client-profile-new-password-again"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  value={newPasswordAgain}
                  onChange={(event) =>
                    setNewPasswordAgain(
                      event.target.value,
                    )
                  }
                  disabled={passwordSaving}
                  className="w-full rounded-xl border border-[#E3E9EF] bg-[#F7F9FC] px-4 py-3 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {passwordMessage && (
                <div
                  role="status"
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    passwordMessage.tone ===
                    "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {
                    passwordMessage.text
                  }
                </div>
              )}

              <div className="flex justify-end border-t border-[#E3E9EF] pt-5">
                <button
                  type="submit"
                  disabled={
                    passwordSaving
                  }
                  className={studioButtonClass("primary", "md")}
                >
                  {passwordSaving
                    ? "Değiştiriliyor…"
                    : "Şifreyi Değiştir"}
                </button>
              </div>
            </form>
          </div>
        </StudioCard>
      </div>
    </div>
  );
}
