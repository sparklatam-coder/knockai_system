"use client";

import { useState, useEffect, useMemo } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export interface Territory {
  id: string;
  sido: string;
  sigungu: string;
  dong: string | null;
  specialty: string;
  status: "secured" | "recruiting" | "available";
  client_id: string | null;
  client_name: string | null;
  keyword: string | null;
  current_rank: number | null;
}

/** Seed data used when Supabase is unavailable */
const SEED_TERRITORIES: Territory[] = [
  { id: "1", sido: "경기도", sigungu: "양주시", dong: null, specialty: "치과", status: "secured", client_id: null, client_name: "양주이지치과", keyword: "양주치과", current_rank: 3 },
  { id: "2", sido: "경기도", sigungu: "광명시", dong: null, specialty: "내과", status: "secured", client_id: null, client_name: "노내과의원", keyword: "광명내과", current_rank: 1 },
  { id: "3", sido: "제주특별자치도", sigungu: "제주시", dong: null, specialty: "정형외과", status: "secured", client_id: null, client_name: "제주팔팔의원", keyword: "제주정형외과", current_rank: 1 },
  { id: "4", sido: "서울특별시", sigungu: "강남구", dong: null, specialty: "피부과", status: "secured", client_id: null, client_name: "에스앤유피부과", keyword: "강남피부과", current_rank: 2 },
  { id: "5", sido: "서울특별시", sigungu: "강남구", dong: null, specialty: "치과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "6", sido: "서울특별시", sigungu: "서초구", dong: null, specialty: "내과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "7", sido: "서울특별시", sigungu: "송파구", dong: null, specialty: "정형외과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "8", sido: "서울특별시", sigungu: "마포구", dong: null, specialty: "피부과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "9", sido: "경기도", sigungu: "수원시", dong: null, specialty: "치과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "10", sido: "경기도", sigungu: "성남시", dong: null, specialty: "내과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "11", sido: "경기도", sigungu: "고양시", dong: null, specialty: "한의원", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "12", sido: "부산광역시", sigungu: "해운대구", dong: null, specialty: "치과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "13", sido: "부산광역시", sigungu: "부산진구", dong: null, specialty: "내과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "14", sido: "대구광역시", sigungu: "수성구", dong: null, specialty: "피부과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "15", sido: "인천광역시", sigungu: "남동구", dong: null, specialty: "치과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "16", sido: "대전광역시", sigungu: "유성구", dong: null, specialty: "정형외과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "17", sido: "광주광역시", sigungu: "북구", dong: null, specialty: "한의원", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
  { id: "18", sido: "울산광역시", sigungu: "남구", dong: null, specialty: "내과", status: "recruiting", client_id: null, client_name: null, keyword: null, current_rank: null },
];

export function useTerritories() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("territories")
            .select("*")
            .order("sido")
            .order("sigungu");
          if (!error && data && data.length > 0) {
            setTerritories(data as Territory[]);
            setLoading(false);
            return;
          }
        } catch {
          // fall through to seed data
        }
      }
      setTerritories(SEED_TERRITORIES);
      setLoading(false);
    }
    fetch();
  }, []);

  const stats = useMemo(() => {
    const secured = territories.filter((t) => t.status === "secured").length;
    const recruiting = territories.filter((t) => t.status === "recruiting").length;
    return { secured, recruiting, total: territories.length };
  }, [territories]);

  return { territories, loading, stats };
}
