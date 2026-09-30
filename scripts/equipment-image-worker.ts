import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

loadEnvConfig(process.cwd());

type Equipment = {
  id: string;
  name: string;
  slug: string;
  equipment_type: string;
  summary: string | null;

  max_flow_lph: number | null;
  max_head_m: number | null;
  power_watts: number | null;

  best_for: string | null;
  installation_notes: string | null;

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
    process.argv.find(
      (value) =>
        value.startsWith(
          "--limit=",
        ),
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

function friendlyType(
  type: string,
) {
  const labels:
    Record<string, string> = {
      "pond-pump":
        "submersible pond filter and circulation pump",
      "pond-filter":
        "garden pond filtration unit",
      "uv-clarifier":
        "pond ultraviolet clarifier",
      "air-pump":
        "garden pond aeration pump",
      "pond-vacuum":
        "pond vacuum and cleaning equipment",
      "pond-liner":
        "flexible garden pond liner",
      underlay:
        "protective pond liner underlay",
      "water-test-kit":
        "pond water testing kit",
      maintenance:
        "garden pond maintenance equipment",
      other:
        "garden pond equipment",
    };

  return (
    labels[type] ??
    "garden pond equipment"
  );
}

function buildPrompt(
  equipment: Equipment,
) {
  const type =
    friendlyType(
      equipment.equipment_type,
    );

  const summary =
    equipment.summary
      ? `Functional context: ${equipment.summary}`
      : "";

  const flow =
    equipment.max_flow_lph
      ? `The researched equipment class has a flow capability around ${equipment.max_flow_lph} litres per hour.`
      : "";

  const head =
    equipment.max_head_m
      ? `Its researched use includes pumping against head up to approximately ${equipment.max_head_m} metres.`
      : "";

  const bestFor =
    equipment.best_for
      ? `Typical use: ${equipment.best_for}`
      : "";

  const installation =
    equipment.installation_notes
      ? `Installation context: ${equipment.installation_notes}`
      : "";

  return `
Create a high-quality photorealistic editorial
illustration for PondStuff, an independent UK
garden-pond resource.

SUBJECT CATEGORY:

${type}

${summary}

${flow}

${head}

${bestFor}

${installation}

IMPORTANT:

This is an illustrative editorial image representing
the TYPE and FUNCTION of the pond equipment.

It must NOT claim to depict a specific commercial
product, manufacturer or model.

Do not reproduce or imitate the exact appearance of
a branded commercial product.

Do not invent manufacturer-specific casing details,
controls, connectors or distinctive industrial
design.

Show a plausible generic example of this equipment
category in an appropriate UK garden-pond setting.

The equipment should be the clear primary subject.

Use realistic scale, materials and installation
context.

Natural British garden lighting.

Professional garden and product photography feel.

Landscape editorial composition suitable for a
website equipment-profile hero image.

Clean, credible and practical rather than futuristic.

Leave useful breathing room around the primary
subject.

Do not include:

brand names,
logos,
model numbers,
product codes,
trademarks,
labels,
written text,
packaging,
watermarks,
people,
hands,
retailer branding,
fake certification marks,
instruction manuals,
fantasy technology.

Do not imply that the illustration is documentary
evidence of the exact researched product.

Generate one image only.
`.trim();
}

async function getEquipment(
  limit: number,
): Promise<Equipment[]> {
  const { data, error } =
    await supabase
      .from("equipment")
      .select(`
        id,
        name,
        slug,
        equipment_type,
        summary,
        max_flow_lph,
        max_head_m,
        power_watts,
        best_for,
        installation_notes,
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
      `Could not load equipment: ${error.message}`,
    );
  }

  return (
    data ?? []
  ) as Equipment[];
}

async function generateEquipmentImage(
  equipment: Equipment,
) {
  console.log("");

  console.log(
    `⚙️ Generating illustrative image: ${equipment.name}`,
  );

  console.log(
    `   Type: ${equipment.equipment_type}`,
  );

  const result =
    await openai.images.generate({
      model: "gpt-image-2",
      prompt:
        buildPrompt(equipment),
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

  const bytes =
    Buffer.from(
      base64,
      "base64",
    );

  if (
    bytes.length === 0
  ) {
    throw new Error(
      "Generated image was empty.",
    );
  }

  const path =
    `equipment/ai-${equipment.slug}-${Date.now()}.jpg`;

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
        contentType:
          "image/jpeg",
      },
    );

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

  /*
   * Because the visual is deliberately generic,
   * the alt text must not claim that it shows the
   * exact commercial product.
   */
  const alt =
    `Illustrative ${friendlyType(
      equipment.equipment_type,
    )} for a garden pond`;

  const {
    data: updated,
    error: updateError,
  } = await supabase
    .from("equipment")
    .update({
      image_url: imageUrl,
      image_alt: alt,
      image_credit:
        "AI-generated illustrative image for PondStuff",
    })
    .eq(
      "id",
      equipment.id,
    )
    .is(
      "image_url",
      null,
    )
    .select("id")
    .maybeSingle();

  if (updateError) {
    /*
     * Keep the uploaded file if the DB update
     * fails so the failure remains recoverable.
     */
    throw new Error(
      `Equipment update failed: ${updateError.message}`,
    );
  }

  if (!updated) {
    throw new Error(
      "Equipment image was not attached because the record already has an image.",
    );
  }

  console.log(
    `✓ Uploaded: ${path}`,
  );

  console.log(
    `✓ Updated: ${equipment.name}`,
  );

  return imageUrl;
}

async function main() {
  const limit =
    getLimit();

  console.log(
    "⚙️ PondStuff Equipment Image Worker",
  );

  console.log(
    `Test/batch limit: ${limit}`,
  );

  console.log(
    "Only draft equipment records without images will be processed.",
  );

  console.log(
    "Images are illustrative and must not represent themselves as exact commercial-product photography.",
  );

  const equipment =
    await getEquipment(limit);

  if (
    equipment.length === 0
  ) {
    console.log(
      "✓ No draft equipment needs images.",
    );

    return;
  }

  let completed = 0;

  for (
    const item of equipment
  ) {
    try {
      await generateEquipmentImage(
        item,
      );

      completed += 1;
    } catch (error) {
      console.error("");

      console.error(
        `✗ ${item.name}`,
      );

      console.error(
        error instanceof Error
          ? error.message
          : error,
      );

      /*
       * Stop rather than continuing to spend
       * image API credit after an unexpected
       * failure.
       */
      break;
    }
  }

  console.log("");

  console.log(
    `✓ ${completed} image(s) completed.`,
  );
}

main().catch(
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
