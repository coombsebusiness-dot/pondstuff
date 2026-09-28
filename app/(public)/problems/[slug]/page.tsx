import type { Metadata } from "next";
import PublicArticlePage, {
  getArticleMetadata,
} from "@/components/articles/PublicArticlePage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return getArticleMetadata(
    slug,
    "problem",
  );
}

export default async function Page({
  params,
}: PageProps) {
  const { slug } = await params;

  return (
    <PublicArticlePage
      slug={slug}
      contentType="problem"
    />
  );
}
