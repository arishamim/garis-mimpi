"use client";

import { useEffect, useState } from "react";
import { designers as mockDesigners, type Designer } from "@/data/mock";
import DesignerCard from "@/components/DesignerCard";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

type WorkRow = { owner: string; image_url: string; stars: number | null };
type ProfileRow = { user_id: string; username: string; full_name: string | null };
type StarRow = { designer_id: string; points: number };

export default function Home() {
  const { lang } = useApp();
  const [allDesigners, setAllDesigners] = useState<Designer[]>(mockDesigners);

  useEffect(() => {
    let active = true;

    async function loadWorksAndStars() {
      const [worksResult, profilesResult, starsResult] = await Promise.all([
        supabase.from("works").select("owner, image_url, stars").order("created_at", { ascending: false }),
        supabase.from("gm_profiles").select("user_id, username, full_name"),
        supabase.from("gm_star_ledger").select("designer_id, points"),
      ]);

      // Keep existing demo cards visible even if the database has not been configured for every table.
      const profileByUser = new Map<string, ProfileRow>();
      (profilesResult.data ?? []).forEach((profile) => profileByUser.set(profile.user_id, profile));

      const totals: Record<string, number> = {};
      (starsResult.data ?? []).forEach((entry: StarRow) => {
        totals[entry.designer_id] = (totals[entry.designer_id] ?? 0) + Number(entry.points || 0);
      });

      const byOwner: Record<string, Designer> = {};
      if (!worksResult.error && worksResult.data) {
        (worksResult.data as WorkRow[]).forEach((work) => {
          const owner = work.owner;
          if (!byOwner[owner]) {
            const matchingProfile = Array.from(profileByUser.values()).find((profile) => profile.username === owner);
            byOwner[owner] = {
              id: "user-" + owner,
              name: matchingProfile?.full_name?.trim() || owner,
              stars: matchingProfile ? (totals[matchingProfile.user_id] ?? 0) : 0,
              photos: [],
            };
          }
          byOwner[owner].photos.push(work.image_url);
          // Keep work-level stars only as a fallback if this owner has no linked profile.
          const matchingProfile = Array.from(profileByUser.values()).find((profile) => profile.username === owner);
          if (!matchingProfile) byOwner[owner].stars += Number(work.stars || 0);
        });
      }

      // Include registered designers with awarded stars even if they have not uploaded a work yet.
      profileByUser.forEach((profile) => {
        const starCount = totals[profile.user_id] ?? 0;
        if (starCount > 0 && !byOwner[profile.username]) {
          byOwner[profile.username] = {
            id: "user-" + profile.username,
            name: profile.full_name?.trim() || profile.username,
            stars: starCount,
            photos: ["https://picsum.photos/seed/garismimpi-profile/600/400"],
          };
        }
      });

      if (!active) return;
      const uploaded = Object.values(byOwner);
      const combined = [...uploaded, ...mockDesigners];
      // Real profile cards replace a demo card with the same username/id, avoiding duplicates.
      const realIds = new Set(uploaded.map((designer) => designer.id));
      setAllDesigners(combined.filter((designer) => !realIds.has(designer.id) || uploaded.includes(designer)));
    }

    void loadWorksAndStars();
    return () => { active = false; };
  }, []);

  const t = {
    id: { badge: "★ KARYA ANAK MUDA, UNTUK SEMUA", title: "Garis Mimpi,", sub: "DESAIN BERANI, IDE NYATA." },
    en: { badge: "★ YOUNG CREATIVES, FOR EVERYONE", title: "Garis Mimpi,", sub: "BOLD DESIGN, REAL IDEAS." },
  }[lang];

  const sorted = [...allDesigners].sort((a, b) => b.stars - a.stars);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ color: "#FF6B00", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
          {t.badge}
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.1 }}>
          {t.title}<br />
          <span style={{ color: "#FF6B00" }}>{t.sub}</span>
        </h1>
      </div>

      <div className="designer-grid">
        {sorted.map((designer) => (
          <DesignerCard key={designer.id} designer={designer} />
        ))}
      </div>
    </div>
  );
}
