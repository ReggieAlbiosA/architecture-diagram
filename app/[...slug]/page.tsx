import { notFound } from "next/navigation";

export default async function CatchAllPage() {
  "use cache";
  notFound();
}
