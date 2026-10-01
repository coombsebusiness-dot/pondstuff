import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

loadEnvConfig(process.cwd());

type Plant = {
  id: string;
  common_name: string;
  scientific_name: string | null;
  slug: string;
  plant_type: string | null;
  summary: string | null;
  description: string | null;
  growth_habit: string | null;
  planting_method: string | null;
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
  const argument = process.argv.find(
    (value) =>
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

function buildPrompt(plant: Plant) {
  const scientific =
    plant.scientific_name
      ? `Scientific identity: ${plant.scientific_name}.`
      : "";

  const type =
    plant.plant_type
      ? `Pond plant classification: ${plant.plant_type}.`
      : "";

  const summary =
    plant.summary
      ? `Research summary: ${plant.summary}`
      : "";

  const growth =
    plant.growth_habit
      ? `Growth habit: ${plant.growth_habit}`
      : "";

  const planting =
    plant.planting_method
      ? `Planting context: ${plant.planting_method}`
      : "";

  return `
Create a botanically plausible, photorealistic
editorial photograph for PondStuff, an independent
UK garden pond resource.

PRIMARY SUBJECT:
${plant.common_name}

${scientific}
${type}
${summary}
${growth}
${planting}

The plant must be the clear dominant subject and
should be depicted in an environmentally appropriate
UK garden-pond setting consistent with the supplied
research.

Prioritise accurate botanical appearance:
leaf shape, flower form and colour, stems, growth
habit, and relationship to the water should match
the named plant as closely as possible.

Natural British garden lighting.
Realistic pond water and surrounding vegetation.
Professional nature and garden photography.
Landscape editorial composition.
Useful as a website plant-profile hero image.
Leave some natural breathing room around the plant.

Do not include:
text,
labels,
captions,
logos,
watermarks,
people,
hands,
plant pots unless the supplied planting information
specifically makes a visible basket appropriate,
fantasy vegetation,
decorative species that could be confused with the
primary plant.

Do not invent flowers if the plant is primarily
identified by foliage or submerged growth.

Generate one image only.
`.trim();
}

async function getPlants(
  limit: number,
): Promise<Plant[]> {
  const { data, error } = await supabase
    .from("plants")
    .select(`
      id,
      common_name,
      scientific_name,
      slug,
      plant_type,
      summary,
      description,
      growth_habit,
      planting_method,
      image_alt
    `)
    .eq(
      "is_plant_finder_suitable",
      true,
    )
    .is("image_url", null)
    .order("common_name", {
      ascending: true,
    })
    .limit(limit);

  if (error) {
    throw new Error(
      `Could not load plants: ${error.message}`,
    );
  }

  return (data ?? []) as Plant[];
}

async function generatePlantImage(
  plant: Plant,
) {
  console.log("");
  console.log(
    `🌿 Generating image: ${plant.common_name}`,
  );

  if (plant.scientific_name) {
    console.log(
      `   ${plant.scientific_name}`,
    );
  }

  const result =
    await openai.images.generate({
      model: "gpt-image-2",
      prompt: buildPrompt(plant),
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
    `plants/ai-${plant.slug}-${Date.now()}.jpg`;

  const { error: uploadError } =
    await supabase.storage
      .from("article-images")
      .upload(path, bytes, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      });

  if (uploadError) {
    throw new Error(
      `Storage upload failed: ${uploadError.message}`,
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
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
    plant.image_alt?.trim() ||
    (
      plant.scientific_name
        ? `${plant.common_name} (${plant.scientific_name}) pond plant`
        : `${plant.common_name} pond plant`
    );

  const { error: updateError } =
    await supabase
      .from("plants")
      .update({
        image_url: imageUrl,
        image_alt: alt,
        image_credit:
          "AI-generated image for PondStuff",
      })
      .eq("id", plant.id)
      .is("image_url", null);

  if (updateError) {
    /*
     * Do not delete the uploaded file here.
     * Keeping it makes failures recoverable
     * and avoids accidental destructive work.
     */
    throw new Error(
      `Plant update failed: ${updateError.message}`,
    );
  }

  console.log(
    `✓ Uploaded: ${path}`,
  );

  console.log(
    `✓ Updated: ${plant.common_name}`,
  );

  return imageUrl;
}

async function main() {
  const limit = getLimit();

  console.log(
    "🌿 PondStuff Plant Image Worker",
  );

  console.log(
    `Test/batch limit: ${limit}`,
  );

  console.log(
    "Only Plant Finder eligible records without images will be processed.",
  );

  const plants =
    await getPlants(limit);

  if (plants.length === 0) {
    console.log(
      "✓ No eligible plants need images.",
    );
    return;
  }

  let completed = 0;

  for (const plant of plants) {
    try {
      await generatePlantImage(plant);
      completed += 1;
    } catch (error) {
      console.error("");
      console.error(
        `✗ ${plant.common_name}`,
      );

      console.error(
        error instanceof Error
          ? error.message
          : error,
      );

      /*
       * For this first version, stop on an
       * image failure rather than continuing
       * to spend API credit blindly.
       */
      break;
    }
  }

  console.log("");
  console.log(
    `✓ ${completed} image(s) completed.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
