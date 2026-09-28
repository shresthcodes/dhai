import type { Metadata } from "next";
import { ShowcaseClient } from "./ShowcaseClient";

export const metadata: Metadata = {
  title: "Showcase — DHAI Concept Visualisation",
  description: "Concept visualisation of DHAI across Web Portal, Research Interface, Museum Kiosk and Smart Display.",
};

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
