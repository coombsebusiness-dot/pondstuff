import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

loadEnvConfig(process.cwd());

type Fish = {
  id: string;
  common_name: string;
  scientific_name: string | null;
  slug: string;
  summary: string | null;
  description: string | null;
  temperament: string | null;
  care_level: string | null;
  image_alt: string | null;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const openAiKey =
  process.env.OPENAI_API_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing.",
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing.",
  );
}

if (!openAiKey) {
  throw new Error(
    "OPENAI_API_KEY is missing.",
  );
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const openai = new OpenAI({
  apiKey: openAiKey,
});

function getLimit() {
  const argument =
    process.argv.find((value) =>
      value.startsWith("--limit="),
    );

  if (!argument) {
    return 1;
  }

  const value = Number(
    argument.split("=")[1],
  );

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 100
  ) {
    throw new Error(
      "--limit must be between 1 and 100.",
    );
  }

  return value;
}

function buildPrompt(fish: Fish) {
  const scientificName =
    fish.scientific_name
      ? `Scientific name: ${fish.scientific_name}`
      : "";

  const summary = fish.summary
    ? `Context: ${fish.summary}`
    : "";

  const temperament = fish.temperament
    ? `Temperament: ${fish.temperament}`
    : "";

  const care = fish.care_level
    ? `Care level: ${fish.care_level}`
    : "";

  return `
Create a high-quality photorealistic editorial
illustration for PondStuff, an independent UK
garden-pond resource.

SUBJECT:

${fish.common_name}

${scientificName}

${summary}

${temperament}

${care}

IMPORTANT:

Create a realistic representation of the named
pond fish species or recognised ornamental variety.

The fish should be the clear primary subject.

Show it naturally in a clean, healthy garden-pond
environment appropriate to the species.

For ornamental fish, accurately represent the
recognisable colouration and body shape associated
with the named variety.

For wild/native pond fish, show a natural realistic
appearance rather than an aquarium-style tropical
presentation.

Use realistic anatomy, scales, fins, proportions,
colouration and lighting.

Professional wildlife and pond photography feel.

Natural British garden-pond setting where appropriate.

Clean, credible and practical rather than fantasy.

Landscape editorial composition suitable for a
website fish-profile hero image.

Leave useful breathing room around the fish.

Do not include:

people,
hands,
brand names,
logos,
text,
labels,
watermarks,
packaging,
aquariums unless genuinely appropriate,
fantasy features,
unrealistic colours,
multiple unrelated fish species.

Do not depict a specific commercial product.

Generate one image only.
`.trim();
}

async function getFish(
  limit: number,
): Promise<Fish[]> {
  const { data, error } =
    await supabase
      .from("fish")
      .select(`
        id,
        common_name,
        scientific_name,
        slug,
        summary,
        description,
        temperament,
        care_level,
        image_alt
      `)
      .eq("status", "draft")
      .is("image_url", null)
      .order("created_at", {
        ascending: true,
      })
      .limit(limit);

  if (error) {
    throw new Error(
      `Could not load fish: ${error.message}`,
    );
  }

  return (data ?? []) as Fish[];
}

async function generateFishImage(
  fish: Fish,
) {
  console.log("");
  console.log(
    `🐟 Generating fish image: ${fish.common_name}`,
  );

  if (fish.scientific_name) {
    console.log(
      `   Species: ${fish.scientific_name}`,
    );
  }

  const result =
    await openai.images.generate({
      model: "gpt-image-2",
      prompt: buildPrompt(fish),
      size: "1536x1024",
      quality: "medium",
      output_format: "jpeg",
      output_compression: 88,
      n: 1,
    });

  const base64 =
    result.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error(
      "OpenAI returned no image data.",
    );
  }

  const bytes = Buffer.from(
    base64,
    "base64",
  );

  if (bytes.length === 0) {
    throw new Error(
      "Generated image was empty.",
    );
  }

  const path =
    `fish/ai-${fish.slug}-${Date.now()}.jpg`;

  const {
    error: uploadError,
  } = await supabase.storage
    .from("article-images")
    .upload(
      path,
      bytes,
      {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      },
    );

  if (uploadError) {
    throw new Error(
      `Storage upload failed: ${uploadError.message}`,
    );
  }

  const {
    data: publicUrlData,
  } =
    supabase.storage
      .from("article-images")
      .getPublicUrl(path);

  const imageUrl =
    publicUrlData.publicUrl;

  if (!imageUrl) {
    throw new Error(
      "Could not create public image URL.",
    );
  }

  const alt =
    fish.image_alt?.trim() ||
    `${fish.common_name} pond fish`;

  const {
    data: updated,
    error: updateError,
  } =
    await supabase
      .from("fish")
      .update({
        image_url: imageUrl,
        image_alt: alt,
        image_credit:
          "AI-generated illustrative image for PondStuff",
      })
      .eq("id", fish.id)
      .is("image_url", null)
      .select("id")
      .maybeSingle();

  if (updateError) {
    throw new Error(
      `Fish update failed: ${updateError.message}`,
    );
  }

  if (!updated) {
    throw new Error(
      "Fish image was not attached because the record already has an image.",
    );
  }

  console.log(
    `✓ Uploaded: ${path}`,
  );

  console.log(
    `✓ Updated: ${fish.common_name}`,
  );

  return imageUrl;
}

async function main() {
  const limit = getLimit();

  console.log(
    "🐟 PondStuff Fish Image Worker",
  );

  console.log(
    `Batch limit: ${limit}`,
  );

  console.log(
    "Only draft fish records without images will be processed.",
  );

  console.log(
    "Images are illustrative editorial images and are not exact commercial product photography.",
  );

  const fish = await getFish(limit);

  if (fish.length === 0) {
    console.log(
      "✓ No draft fish needs images.",
    );
    return;
  }

  let completed = 0;

  for (const item of fish) {
    try {
      await generateFishImage(item);
      completed += 1;
    } catch (error) {
      console.error(
        `Fish image failed: ${item.common_name}`,
        error,
      );
    }
  }

  console.log("");
  console.log(
    `Batch complete. Generated ${completed}/${fish.length} image(s).`,
  );
}

main().catch((error) => {
  console.error(
    "Fish image worker failed:",
    error,
  );
  process.exit(1);
});
