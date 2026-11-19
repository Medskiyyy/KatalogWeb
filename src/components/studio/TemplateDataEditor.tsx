"use client";

import type { ReactNode } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import type {
  BucinSiteConfig,
  NikahSiteConfig,
  SiteConfig,
  UltahSiteConfig,
  UmkmSiteConfig,
} from "@/lib/schema";
import { ImageUploadField } from "@/components/studio/ImageUploadField";
import { AudioUploadField } from "@/components/studio/AudioUploadField";
import { isExtendedNikahSite } from "@/templates/nikah/themes";

interface TemplateDataEditorProps {
  site: SiteConfig;
  studioConnected: boolean;
  onChange: (next: SiteConfig) => void;
}

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none";

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none";

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-100"
    >
      <Plus size={14} weight="bold" />
      <span>{label}</span>
    </button>
  );
}

function RemoveButton({
  onClick,
  disabled,
  label = "Hapus",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Minimal 1 item harus tersisa" : label}
      className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Trash size={13} weight="bold" />
      <span>{label}</span>
    </button>
  );
}

function BucinEditor({
  site,
  studioConnected,
  onChange,
}: {
  site: BucinSiteConfig;
  studioConnected: boolean;
  onChange: (next: BucinSiteConfig) => void;
}) {
  const { data } = site;

  const updateData = (patch: Partial<BucinSiteConfig["data"]>) => {
    onChange({
      ...site,
      data: {
        ...data,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Profil Pasangan & Kunci PIN">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nama Pasangan 1">
            <input
              type="text"
              value={data.partnerOne}
              onChange={(e) => updateData({ partnerOne: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Nama Pasangan 2">
            <input
              type="text"
              value={data.partnerTwo}
              onChange={(e) => updateData({ partnerTwo: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Tanggal Jadian">
            <input
              type="date"
              value={data.anniversaryDate}
              onChange={(e) => updateData({ anniversaryDate: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="PIN Kunci 4 Digit (opsional)">
            <input
              type="text"
              maxLength={4}
              value={data.passcodePin}
              onChange={(e) => updateData({ passcodePin: e.target.value })}
              placeholder="Kosongkan jika tanpa PIN"
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Judul Utama (Hero Headline)">
          <input
            type="text"
            value={data.heroHeadline}
            onChange={(e) => updateData({ heroHeadline: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Catatan Pembuka">
          <textarea
            rows={3}
            value={data.openingNote}
            onChange={(e) => updateData({ openingNote: e.target.value })}
            className={TEXTAREA_CLASS}
          />
        </Field>
      </SectionCard>

      <SectionCard title="Dedikasi Lagu & Surat Penutup">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Judul Lagu">
            <input
              type="text"
              value={data.songDedication.title}
              onChange={(e) =>
                updateData({
                  songDedication: {
                    ...data.songDedication,
                    title: e.target.value,
                  },
                })
              }
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Penyanyi / Artis">
            <input
              type="text"
              value={data.songDedication.artist}
              onChange={(e) =>
                updateData({
                  songDedication: {
                    ...data.songDedication,
                    artist: e.target.value,
                  },
                })
              }
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Surat Penutup">
          <textarea
            rows={4}
            value={data.closingLetter}
            onChange={(e) => updateData({ closingLetter: e.target.value })}
            className={TEXTAREA_CLASS}
          />
        </Field>

        {site.templateId === "bucin-chat" && (
          <AudioUploadField
            label="File Voice Note Asli (opsional, MP3)"
            value={data.voiceNoteUrl ?? ""}
            slug={site.slug}
            studioConnected={studioConnected}
            placeholder="/audio/voicenotes/dimas-vn.mp3"
            onChange={(nextUrl) => updateData({ voiceNoteUrl: nextUrl })}
          />
        )}
      </SectionCard>

      <SectionCard
        title={`Alasan Sayang (${data.loveReasons.length})`}
        action={
          <AddButton
            label="Tambah Alasan"
            onClick={() =>
              updateData({
                loveReasons: [...data.loveReasons, "Alasan baru yang berkesan."],
              })
            }
          />
        }
      >
        <div className="space-y-2.5">
          {data.loveReasons.map((reason, index) => (
            <div key={index} className="flex items-start gap-2">
              <input
                type="text"
                value={reason}
                onChange={(e) => {
                  const next = [...data.loveReasons];
                  next[index] = e.target.value;
                  updateData({ loveReasons: next });
                }}
                className={INPUT_CLASS}
              />
              <div className="pt-1.5">
                <RemoveButton
                  disabled={data.loveReasons.length <= 1}
                  onClick={() =>
                    updateData({
                      loveReasons: data.loveReasons.filter((_, i) => i !== index),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Galeri Kenangan (${data.memories.length})`}
        action={
          <AddButton
            label="Tambah Foto"
            onClick={() =>
              updateData({
                memories: [
                  ...data.memories,
                  {
                    imageUrl: "/demo/bucin-1.webp",
                    caption: "Momen baru bersama",
                    dateLabel: "2026",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {data.memories.map((memory, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Foto #{index + 1}
                </span>
                <RemoveButton
                  disabled={data.memories.length <= 1}
                  onClick={() =>
                    updateData({
                      memories: data.memories.filter((_, i) => i !== index),
                    })
                  }
                />
              </div>

              <ImageUploadField
                label="Foto Kenangan"
                value={memory.imageUrl}
                slug={site.slug}
                studioConnected={studioConnected}
                onChange={(nextUrl) => {
                  const next = [...data.memories];
                  next[index] = { ...memory, imageUrl: nextUrl };
                  updateData({ memories: next });
                }}
              />

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Field label="Caption">
                    <input
                      type="text"
                      value={memory.caption}
                      onChange={(e) => {
                        const next = [...data.memories];
                        next[index] = { ...memory, caption: e.target.value };
                        updateData({ memories: next });
                      }}
                      className={INPUT_CLASS}
                    />
                  </Field>
                </div>
                <Field label="Label Tanggal">
                  <input
                    type="text"
                    value={memory.dateLabel}
                    onChange={(e) => {
                      const next = [...data.memories];
                      next[index] = { ...memory, dateLabel: e.target.value };
                      updateData({ memories: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Jejak Cerita / Timeline (${(data.milestones ?? []).length})`}
        action={
          <AddButton
            label="Tambah Momen"
            onClick={() =>
              updateData({
                milestones: [
                  ...(data.milestones ?? []),
                  {
                    dateLabel: "2026",
                    title: "Momen Baru Berdua",
                    description: "Cerita singkat momen berkesan kalian.",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {(data.milestones ?? []).map((item, index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Momen #{index + 1}
                </span>
                <RemoveButton
                  onClick={() =>
                    updateData({
                      milestones: (data.milestones ?? []).filter(
                        (_, i) => i !== index
                      ),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <Field label="Tanggal / Label">
                  <input
                    type="text"
                    value={item.dateLabel}
                    onChange={(e) => {
                      const next = [...(data.milestones ?? [])];
                      next[index] = { ...item, dateLabel: e.target.value };
                      updateData({ milestones: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Judul Momen">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...(data.milestones ?? [])];
                        next[index] = { ...item, title: e.target.value };
                        updateData({ milestones: next });
                      }}
                      className={INPUT_CLASS}
                    />
                  </Field>
                </div>
              </div>
              <Field label="Cerita Singkat">
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => {
                    const next = [...(data.milestones ?? [])];
                    next[index] = { ...item, description: e.target.value };
                    updateData({ milestones: next });
                  }}
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Hal-Hal Receh (${(data.littleThings ?? []).length})`}
        action={
          <AddButton
            label="Tambah Kebiasaan"
            onClick={() =>
              updateData({
                littleThings: [
                  ...(data.littleThings ?? []),
                  {
                    label: "Kebiasaan Baru",
                    detail: "Detail kecil yang selalu diingat.",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {(data.littleThings ?? []).map((item, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Item #{index + 1}
                </span>
                <RemoveButton
                  onClick={() =>
                    updateData({
                      littleThings: (data.littleThings ?? []).filter(
                        (_, i) => i !== index
                      ),
                    })
                  }
                />
              </div>
              <Field label="Judul Kebiasaan">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const next = [...(data.littleThings ?? [])];
                    next[index] = { ...item, label: e.target.value };
                    updateData({ littleThings: next });
                  }}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Detail">
                <input
                  type="text"
                  value={item.detail}
                  onChange={(e) => {
                    const next = [...(data.littleThings ?? [])];
                    next[index] = { ...item, detail: e.target.value };
                    updateData({ littleThings: next });
                  }}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      {site.templateId === "bucin-scrapbook" && (
        <SectionCard
          title={`Kupon / Tiket Kencan (${(data.coupons ?? []).length})`}
        action={
          <AddButton
            label="Tambah Kupon"
            onClick={() =>
              updateData({
                coupons: [
                  ...(data.coupons ?? []),
                  {
                    title: "Kupon Jalan Berdua",
                    note: "Berlaku kapan saja saat lagi pengen jajan.",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {(data.coupons ?? []).map((coupon, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Kupon #{index + 1}
                </span>
                <RemoveButton
                  onClick={() =>
                    updateData({
                      coupons: (data.coupons ?? []).filter(
                        (_, i) => i !== index
                      ),
                    })
                  }
                />
              </div>
              <Field label="Judul Kupon">
                <input
                  type="text"
                  value={coupon.title}
                  onChange={(e) => {
                    const next = [...(data.coupons ?? [])];
                    next[index] = { ...coupon, title: e.target.value };
                    updateData({ coupons: next });
                  }}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Keterangan">
                <input
                  type="text"
                  value={coupon.note}
                  onChange={(e) => {
                    const next = [...(data.coupons ?? [])];
                    next[index] = { ...coupon, note: e.target.value };
                    updateData({ coupons: next });
                  }}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          ))}
        </div>
        </SectionCard>
      )}

      {(site.templateId === "bucin-chat" || site.templateId === "bucin-magazine") && (
        <SectionCard
          title={`Mini Kuis Pasangan (${(data.quizQuestions ?? []).length})`}
          action={
            <AddButton
              label="Tambah Pertanyaan"
              onClick={() =>
                updateData({
                  quizQuestions: [
                    ...(data.quizQuestions ?? []),
                    {
                      question: "Pertanyaan baru seputar kebiasaan kita?",
                      options: ["Pilihan A", "Pilihan B", "Pilihan C"],
                      correctIndex: 0,
                      reaction: "Betul banget, hafal banget ya sama kebiasaan kita!",
                    },
                  ],
                })
              }
            />
          }
        >
          <div className="space-y-3">
            {(data.quizQuestions ?? []).map((quiz, index) => (
              <div
                key={index}
                className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700">
                    Soal Kuis #{index + 1}
                  </span>
                  <RemoveButton
                    onClick={() =>
                      updateData({
                        quizQuestions: (data.quizQuestions ?? []).filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                  />
                </div>
                <Field label="Pertanyaan">
                  <input
                    type="text"
                    value={quiz.question}
                    onChange={(e) => {
                      const next = [...(data.quizQuestions ?? [])];
                      next[index] = { ...quiz, question: e.target.value };
                      updateData({ quizQuestions: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Reaksi Jawaban Benar">
                  <input
                    type="text"
                    value={quiz.reaction}
                    onChange={(e) => {
                      const next = [...(data.quizQuestions ?? [])];
                      next[index] = { ...quiz, reaction: e.target.value };
                      updateData({ quizQuestions: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function UltahEditor({
  site,
  studioConnected,
  onChange,
}: {
  site: UltahSiteConfig;
  studioConnected: boolean;
  onChange: (next: UltahSiteConfig) => void;
}) {
  const { data } = site;

  const updateData = (patch: Partial<UltahSiteConfig["data"]>) => {
    onChange({
      ...site,
      data: {
        ...data,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Data Ulang Tahun">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nama yang Berulang Tahun">
            <input
              type="text"
              value={data.celebrantName}
              onChange={(e) => updateData({ celebrantName: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Usia ke-">
            <input
              type="number"
              min={1}
              max={120}
              value={data.turningAge}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value, 10);
                updateData({
                  turningAge: Number.isFinite(parsed) ? Math.max(1, parsed) : 1,
                });
              }}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Tanggal Lahir / Momen">
            <input
              type="text"
              value={data.birthDateLabel}
              onChange={(e) => updateData({ birthDateLabel: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Nama Pengirim Kado">
            <input
              type="text"
              value={data.senderName}
              onChange={(e) => updateData({ senderName: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Ucapan Utama">
          <textarea
            rows={3}
            value={data.heroWish}
            onChange={(e) => updateData({ heroWish: e.target.value })}
            className={TEXTAREA_CLASS}
          />
        </Field>
      </SectionCard>

      {site.templateId === "ultah-interaktif" && data.giftVoucher && (
        <SectionCard title="Voucher Hadiah">
          <Field label="Judul Voucher">
            <input
              type="text"
              value={data.giftVoucher.title}
              onChange={(e) =>
                updateData({
                  giftVoucher: {
                    title: e.target.value,
                    description: data.giftVoucher?.description ?? "",
                    redeemNote: data.giftVoucher?.redeemNote ?? "",
                  },
                })
              }
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Deskripsi Voucher">
            <textarea
              rows={2}
              value={data.giftVoucher.description}
              onChange={(e) =>
                updateData({
                  giftVoucher: {
                    title: data.giftVoucher?.title ?? "",
                    description: e.target.value,
                    redeemNote: data.giftVoucher?.redeemNote ?? "",
                  },
                })
              }
              className={TEXTAREA_CLASS}
            />
          </Field>
          <Field label="Catatan Klaim (Redeem Note)">
            <input
              type="text"
              value={data.giftVoucher.redeemNote}
              onChange={(e) =>
                updateData({
                  giftVoucher: {
                    title: data.giftVoucher?.title ?? "",
                    description: data.giftVoucher?.description ?? "",
                    redeemNote: e.target.value,
                  },
                })
              }
              className={INPUT_CLASS}
            />
          </Field>
        </SectionCard>
      )}

      <SectionCard
        title={`Galeri Foto (${data.memories.length})`}
        action={
          <AddButton
            label="Tambah Foto"
            onClick={() =>
              updateData({
                memories: [
                  ...data.memories,
                  {
                    imageUrl: "/demo/ultah-1.webp",
                    caption: "Momen seru ulang tahun",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {data.memories.map((memory, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Foto #{index + 1}
                </span>
                <RemoveButton
                  disabled={data.memories.length <= 1}
                  onClick={() =>
                    updateData({
                      memories: data.memories.filter((_, i) => i !== index),
                    })
                  }
                />
              </div>

              <ImageUploadField
                label="Foto Momen"
                value={memory.imageUrl}
                slug={site.slug}
                studioConnected={studioConnected}
                onChange={(nextUrl) => {
                  const next = [...data.memories];
                  next[index] = { ...memory, imageUrl: nextUrl };
                  updateData({ memories: next });
                }}
              />

              <Field label="Caption">
                <input
                  type="text"
                  value={memory.caption}
                  onChange={(e) => {
                    const next = [...data.memories];
                    next[index] = { ...memory, caption: e.target.value };
                    updateData({ memories: next });
                  }}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Ucapan Sahabat (${data.friendWishes.length})`}
        action={
          <AddButton
            label="Tambah Ucapan"
            onClick={() =>
              updateData({
                friendWishes: [
                  ...data.friendWishes,
                  {
                    from: "Sahabat",
                    role: "Teman Dekat",
                    message: "Selamat ulang tahun, sukses selalu!",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {data.friendWishes.map((wish, index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Ucapan #{index + 1}
                </span>
                <RemoveButton
                  disabled={data.friendWishes.length <= 1}
                  onClick={() =>
                    updateData({
                      friendWishes: data.friendWishes.filter((_, i) => i !== index),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field label="Dari">
                  <input
                    type="text"
                    value={wish.from}
                    onChange={(e) => {
                      const next = [...data.friendWishes];
                      next[index] = { ...wish, from: e.target.value };
                      updateData({ friendWishes: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Hubungan / Peran">
                  <input
                    type="text"
                    value={wish.role}
                    onChange={(e) => {
                      const next = [...data.friendWishes];
                      next[index] = { ...wish, role: e.target.value };
                      updateData({ friendWishes: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
              <Field label="Pesan Ucapan">
                <textarea
                  rows={2}
                  value={wish.message}
                  onChange={(e) => {
                    const next = [...data.friendWishes];
                    next[index] = { ...wish, message: e.target.value };
                    updateData({ friendWishes: next });
                  }}
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function NikahEditor({
  site,
  studioConnected,
  onChange,
}: {
  site: NikahSiteConfig;
  studioConnected: boolean;
  onChange: (next: NikahSiteConfig) => void;
}) {
  const { data } = site;

  const updateData = (patch: Partial<NikahSiteConfig["data"]>) => {
    onChange({
      ...site,
      data: {
        ...data,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Mempelai Pria & Wanita">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3">
            <p className="text-xs font-semibold text-zinc-800">Mempelai Pria</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Field label="Nama Panggilan">
                <input
                  type="text"
                  value={data.groom.nickname}
                  onChange={(e) =>
                    updateData({
                      groom: { ...data.groom, nickname: e.target.value },
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Nama Lengkap">
                <input
                  type="text"
                  value={data.groom.fullName}
                  onChange={(e) =>
                    updateData({
                      groom: { ...data.groom, fullName: e.target.value },
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            <Field label="Nama Orang Tua">
              <input
                type="text"
                value={data.groom.parents}
                onChange={(e) =>
                  updateData({
                    groom: { ...data.groom, parents: e.target.value },
                  })
                }
                className={INPUT_CLASS}
              />
            </Field>
            <ImageUploadField
              label="Foto Mempelai Pria"
              value={data.groom.photoUrl}
              slug={site.slug}
              studioConnected={studioConnected}
              onChange={(nextUrl) =>
                updateData({ groom: { ...data.groom, photoUrl: nextUrl } })
              }
            />
          </div>

          <div className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3">
            <p className="text-xs font-semibold text-zinc-800">Mempelai Wanita</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Field label="Nama Panggilan">
                <input
                  type="text"
                  value={data.bride.nickname}
                  onChange={(e) =>
                    updateData({
                      bride: { ...data.bride, nickname: e.target.value },
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Nama Lengkap">
                <input
                  type="text"
                  value={data.bride.fullName}
                  onChange={(e) =>
                    updateData({
                      bride: { ...data.bride, fullName: e.target.value },
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            <Field label="Nama Orang Tua">
              <input
                type="text"
                value={data.bride.parents}
                onChange={(e) =>
                  updateData({
                    bride: { ...data.bride, parents: e.target.value },
                  })
                }
                className={INPUT_CLASS}
              />
            </Field>
            <ImageUploadField
              label="Foto Mempelai Wanita"
              value={data.bride.photoUrl}
              slug={site.slug}
              studioConnected={studioConnected}
              onChange={(nextUrl) =>
                updateData({ bride: { ...data.bride, photoUrl: nextUrl } })
              }
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Waktu Countdown, Kutipan & RSVP">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Tanggal & Jam Acara (ISO)">
            <input
              type="text"
              value={data.weddingDateIso}
              onChange={(e) => updateData({ weddingDateIso: e.target.value })}
              placeholder="2026-12-20T09:00:00+07:00"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Nomor WhatsApp RSVP">
            <input
              type="text"
              value={data.rsvpWhatsapp}
              onChange={(e) => updateData({ rsvpWhatsapp: e.target.value })}
              placeholder="6281234567890"
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Teks Kutipan / Doa">
          <textarea
            rows={2}
            value={data.blessingQuote.text}
            onChange={(e) =>
              updateData({
                blessingQuote: { ...data.blessingQuote, text: e.target.value },
              })
            }
            className={TEXTAREA_CLASS}
          />
        </Field>
        <Field label="Sumber Kutipan">
          <input
            type="text"
            value={data.blessingQuote.source}
            onChange={(e) =>
              updateData({
                blessingQuote: {
                  ...data.blessingQuote,
                  source: e.target.value,
                },
              })
            }
            className={INPUT_CLASS}
          />
        </Field>
      </SectionCard>

      <SectionCard title="Jadwal Akad & Resepsi">
        {(
          [
            ["akad", "Acara Akad Nikah"],
            ["resepsi", "Acara Resepsi"],
          ] as const
        ).map(([key, heading]) => {
          const ev = data[key];
          return (
            <div
              key={key}
              className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <p className="text-xs font-semibold text-zinc-800">{heading}</p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field label="Hari & Tanggal">
                  <input
                    type="text"
                    value={ev.dateLabel}
                    onChange={(e) =>
                      updateData({
                        [key]: { ...ev, dateLabel: e.target.value },
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Jam Acara">
                  <input
                    type="text"
                    value={ev.timeLabel}
                    onChange={(e) =>
                      updateData({
                        [key]: { ...ev, timeLabel: e.target.value },
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
              <Field label="Nama Tempat / Gedung">
                <input
                  type="text"
                  value={ev.venueName}
                  onChange={(e) =>
                    updateData({
                      [key]: { ...ev, venueName: e.target.value },
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Alamat Lengkap">
                <input
                  type="text"
                  value={ev.address}
                  onChange={(e) =>
                    updateData({
                      [key]: { ...ev, address: e.target.value },
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Link Google Maps">
                <input
                  type="text"
                  value={ev.mapsUrl}
                  onChange={(e) =>
                    updateData({
                      [key]: { ...ev, mapsUrl: e.target.value },
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          );
        })}
      </SectionCard>

      <SectionCard
        title={`Linimasa Cerita (${data.storyTimeline.length})`}
        action={
          <AddButton
            label="Tambah Tahap"
            onClick={() =>
              updateData({
                storyTimeline: [
                  ...data.storyTimeline,
                  {
                    year: "2026",
                    title: "Momen Spesial",
                    description: "Cerita singkat perjalanan berdua.",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {data.storyTimeline.map((item, index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Tahap #{index + 1}
                </span>
                <RemoveButton
                  disabled={data.storyTimeline.length <= 1}
                  onClick={() =>
                    updateData({
                      storyTimeline: data.storyTimeline.filter(
                        (_, i) => i !== index
                      ),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <Field label="Tahun">
                  <input
                    type="text"
                    value={item.year}
                    onChange={(e) => {
                      const next = [...data.storyTimeline];
                      next[index] = { ...item, year: e.target.value };
                      updateData({ storyTimeline: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Judul">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...data.storyTimeline];
                        next[index] = { ...item, title: e.target.value };
                        updateData({ storyTimeline: next });
                      }}
                      className={INPUT_CLASS}
                    />
                  </Field>
                </div>
              </div>
              <Field label="Deskripsi">
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => {
                    const next = [...data.storyTimeline];
                    next[index] = { ...item, description: e.target.value };
                    updateData({ storyTimeline: next });
                  }}
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Galeri Prewedding (${data.gallery.length})`}
        action={
          <AddButton
            label="Tambah Foto"
            onClick={() =>
              updateData({
                gallery: [...data.gallery, "/demo/nikah-couple.webp"],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {data.gallery.map((photoUrl, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Foto Galeri #{index + 1}
                </span>
                <RemoveButton
                  disabled={data.gallery.length <= 1}
                  onClick={() =>
                    updateData({
                      gallery: data.gallery.filter((_, i) => i !== index),
                    })
                  }
                />
              </div>
              <ImageUploadField
                label="URL Foto"
                value={photoUrl}
                slug={site.slug}
                studioConnected={studioConnected}
                onChange={(nextUrl) => {
                  const next = [...data.gallery];
                  next[index] = nextUrl;
                  updateData({ gallery: next });
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Amplop Digital (${data.digitalEnvelopes.length})`}
        action={
          <AddButton
            label="Tambah Rekening"
            onClick={() =>
              updateData({
                digitalEnvelopes: [
                  ...data.digitalEnvelopes,
                  {
                    bankName: "BCA",
                    accountNumber: "1234567890",
                    accountHolder: "Nama Pemilik",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {data.digitalEnvelopes.map((env, index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Rekening #{index + 1}
                </span>
                <RemoveButton
                  disabled={data.digitalEnvelopes.length <= 1}
                  onClick={() =>
                    updateData({
                      digitalEnvelopes: data.digitalEnvelopes.filter(
                        (_, i) => i !== index
                      ),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <Field label="Nama Bank / E-Wallet">
                  <input
                    type="text"
                    value={env.bankName}
                    onChange={(e) => {
                      const next = [...data.digitalEnvelopes];
                      next[index] = { ...env, bankName: e.target.value };
                      updateData({ digitalEnvelopes: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Nomor Rekening">
                  <input
                    type="text"
                    value={env.accountNumber}
                    onChange={(e) => {
                      const next = [...data.digitalEnvelopes];
                      next[index] = { ...env, accountNumber: e.target.value };
                      updateData({ digitalEnvelopes: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Atas Nama">
                  <input
                    type="text"
                    value={env.accountHolder}
                    onChange={(e) => {
                      const next = [...data.digitalEnvelopes];
                      next[index] = { ...env, accountHolder: e.target.value };
                      updateData({ digitalEnvelopes: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function UmkmEditor({
  site,
  studioConnected,
  onChange,
}: {
  site: UmkmSiteConfig;
  studioConnected: boolean;
  onChange: (next: UmkmSiteConfig) => void;
}) {
  const { data } = site;

  const updateData = (patch: Partial<UmkmSiteConfig["data"]>) => {
    onChange({
      ...site,
      data: {
        ...data,
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Profil Usaha & Kontak Order">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nama Usaha">
            <input
              type="text"
              value={data.businessName}
              onChange={(e) => updateData({ businessName: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Kategori Usaha">
            <input
              type="text"
              value={data.categoryLabel}
              onChange={(e) => updateData({ categoryLabel: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Kota / Area">
            <input
              type="text"
              value={data.cityLabel}
              onChange={(e) => updateData({ cityLabel: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Jam Buka">
            <input
              type="text"
              value={data.openHoursLabel}
              onChange={(e) => updateData({ openHoursLabel: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Nomor WhatsApp Order">
            <input
              type="text"
              value={data.whatsappNumber}
              onChange={(e) => updateData({ whatsappNumber: e.target.value })}
              placeholder="6281234567890"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Link Google Maps">
            <input
              type="text"
              value={data.mapsUrl}
              onChange={(e) => updateData({ mapsUrl: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Tagline">
          <input
            type="text"
            value={data.tagline}
            onChange={(e) => updateData({ tagline: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Deskripsi Usaha">
          <textarea
            rows={3}
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            className={TEXTAREA_CLASS}
          />
        </Field>

        <Field label="Alamat Lengkap">
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>

        <ImageUploadField
          label="Foto Banner Utama (Hero)"
          value={data.heroImageUrl}
          slug={site.slug}
          studioConnected={studioConnected}
          onChange={(nextUrl) => updateData({ heroImageUrl: nextUrl })}
        />
      </SectionCard>

      <SectionCard title="3 Keunggulan Utama">
        <div className="space-y-3">
          {data.highlights.map((item, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <p className="text-xs font-semibold text-zinc-700">
                Keunggulan #{index + 1}
              </p>
              <Field label="Judul">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const next = [...data.highlights];
                    next[index] = { ...item, title: e.target.value };
                    updateData({ highlights: next });
                  }}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Deskripsi">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => {
                    const next = [...data.highlights];
                    next[index] = { ...item, description: e.target.value };
                    updateData({ highlights: next });
                  }}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Daftar Produk (${data.products.length})`}
        action={
          <AddButton
            label="Tambah Produk"
            onClick={() =>
              updateData({
                products: [
                  ...data.products,
                  {
                    id: `produk-${Date.now().toString(36)}`,
                    name: "Produk Baru",
                    category: "Umum",
                    price: 25000,
                    unitLabel: "pcs",
                    description: "Deskripsi singkat produk.",
                    imageUrl: "/demo/umkm-hero.webp",
                    featured: false,
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {data.products.map((product, index) => (
            <div
              key={product.id || index}
              className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Produk #{index + 1} ({product.id})
                </span>
                <RemoveButton
                  disabled={data.products.length <= 1}
                  onClick={() =>
                    updateData({
                      products: data.products.filter((_, i) => i !== index),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field label="Nama Produk">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => {
                      const next = [...data.products];
                      next[index] = { ...product, name: e.target.value };
                      updateData({ products: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Kategori">
                  <input
                    type="text"
                    value={product.category}
                    onChange={(e) => {
                      const next = [...data.products];
                      next[index] = { ...product, category: e.target.value };
                      updateData({ products: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Harga (Rupiah)">
                  <input
                    type="number"
                    min={0}
                    value={product.price}
                    onChange={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10);
                      const next = [...data.products];
                      next[index] = {
                        ...product,
                        price: Number.isFinite(parsed)
                          ? Math.max(0, parsed)
                          : 0,
                      };
                      updateData({ products: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Satuan (mis. pcs / botol)">
                  <input
                    type="text"
                    value={product.unitLabel}
                    onChange={(e) => {
                      const next = [...data.products];
                      next[index] = { ...product, unitLabel: e.target.value };
                      updateData({ products: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>

              <Field label="Deskripsi Produk">
                <textarea
                  rows={2}
                  value={product.description}
                  onChange={(e) => {
                    const next = [...data.products];
                    next[index] = { ...product, description: e.target.value };
                    updateData({ products: next });
                  }}
                  className={TEXTAREA_CLASS}
                />
              </Field>

              <ImageUploadField
                label="Foto Produk"
                value={product.imageUrl}
                slug={site.slug}
                studioConnected={studioConnected}
                onChange={(nextUrl) => {
                  const next = [...data.products];
                  next[index] = { ...product, imageUrl: nextUrl };
                  updateData({ products: next });
                }}
              />

              <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={Boolean(product.featured)}
                  onChange={(e) => {
                    const next = [...data.products];
                    next[index] = { ...product, featured: e.target.checked };
                    updateData({ products: next });
                  }}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                />
                <span>Tandai sebagai menu unggulan</span>
              </label>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Testimoni Pelanggan (${data.testimonials.length})`}
        action={
          <AddButton
            label="Tambah Testimoni"
            onClick={() =>
              updateData({
                testimonials: [
                  ...data.testimonials,
                  {
                    quote: "Pelayanan cepat dan kualitas produknya memuaskan.",
                    author: "Pelanggan",
                    role: "Pembeli Terverifikasi",
                  },
                ],
              })
            }
          />
        }
      >
        <div className="space-y-3">
          {data.testimonials.map((item, index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Testimoni #{index + 1}
                </span>
                <RemoveButton
                  disabled={data.testimonials.length <= 1}
                  onClick={() =>
                    updateData({
                      testimonials: data.testimonials.filter(
                        (_, i) => i !== index
                      ),
                    })
                  }
                />
              </div>

              <Field label="Kutipan Testimoni">
                <textarea
                  rows={2}
                  value={item.quote}
                  onChange={(e) => {
                    const next = [...data.testimonials];
                    next[index] = { ...item, quote: e.target.value };
                    updateData({ testimonials: next });
                  }}
                  className={TEXTAREA_CLASS}
                />
              </Field>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field label="Nama Pelanggan">
                  <input
                    type="text"
                    value={item.author}
                    onChange={(e) => {
                      const next = [...data.testimonials];
                      next[index] = { ...item, author: e.target.value };
                      updateData({ testimonials: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Peran / Keterangan">
                  <input
                    type="text"
                    value={item.role}
                    onChange={(e) => {
                      const next = [...data.testimonials];
                      next[index] = { ...item, role: e.target.value };
                      updateData({ testimonials: next });
                    }}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function TemplateDataEditor({
  site,
  studioConnected,
  onChange,
}: TemplateDataEditorProps) {
  if (isExtendedNikahSite(site)) {
    return (
      <NikahEditor
        site={site}
        studioConnected={studioConnected}
        onChange={onChange}
      />
    );
  }

  switch (site.templateId) {
    case "bucin-scrapbook":
    case "bucin-chat":
    case "bucin-playlist":
    case "bucin-magazine":
      return (
        <BucinEditor
          site={site}
          studioConnected={studioConnected}
          onChange={onChange}
        />
      );
    case "ultah-interaktif":
    case "ultah-balon":
    case "ultah-retro":
    case "ultah-editorial":
      return (
        <UltahEditor
          site={site}
          studioConnected={studioConnected}
          onChange={onChange}
        />
      );
    case "nikah-garden":
    case "nikah-minang":
    case "nikah-jawa":
    case "nikah-sunda":
    case "nikah-motion":
      return (
        <NikahEditor
          site={site}
          studioConnected={studioConnected}
          onChange={onChange}
        />
      );
    case "umkm-katalog":
    case "umkm-kuliner":
    case "umkm-fashion":
    case "umkm-jasa":
      return (
        <UmkmEditor
          site={site}
          studioConnected={studioConnected}
          onChange={onChange}
        />
      );
  }
}
