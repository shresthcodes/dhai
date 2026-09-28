import type { Metadata } from "next";
import { HomeHero }          from "@/components/archive/HomeHero";
import { HomeSearch }        from "@/components/archive/HomeSearch";
import { HomeExplore }       from "@/components/archive/HomeExplore";
import { HomePipeline }      from "@/components/archive/HomePipeline";
import { HomeAsk }           from "@/components/archive/HomeAsk";
import { HomeTimeline }      from "@/components/archive/HomeTimeline";
import { HomeAccess }        from "@/components/archive/HomeAccess";
import { HomeScreens }       from "@/components/archive/HomeScreens";
import { HomeInstitutional } from "@/components/archive/HomeInstitutional";

export const metadata: Metadata = {
  title: "DHAI — Digital Heritage Archive & Intelligence",
  description:
    "A national digital museum, scholarly archive and AI research platform. " +
    "Prototype built for Smart India Hackathon 2026.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeSearch />
      <HomeExplore />
      <HomePipeline />
      <HomeAsk />
      <HomeTimeline />
      <HomeAccess />
      <HomeScreens />
      <HomeInstitutional />
    </>
  );
}
