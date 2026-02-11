import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const IMAGE_PROMPTS = [
  {
    name: "hero-new-to-cdbl",
    prompt:
      "A warm, welcoming photograph of a parent walking with a young child (age 5-6) toward a youth baseball field on a bright sunny day. The child is wearing a carolina blue baseball jersey with white 'Rockets' script text across the chest, white baseball pants with thin blue piping, a carolina blue baseball cap, and carrying a small brown leather baseball glove. The parent has their hand on the child's shoulder. Lush green grass field and blue sky in background. Lifestyle sports photography, natural lighting, 16:9 aspect ratio, ultra high resolution.",
  },
  {
    name: "hero-find-program",
    prompt:
      "A group of youth baseball players (ages 7-12) practicing on a green baseball field on a sunny day. Half the players wear light carolina blue jerseys with white 'Rockets' text, the other half wear dark navy blue jerseys with white 'Rockets' text. All players wear white baseball pants with blue piping and blue baseball caps. They are stretching and warming up together. Lifestyle sports photography, natural lighting, 16:9 aspect ratio, ultra high resolution.",
  },
  {
    name: "hero-registration",
    prompt:
      "A smiling youth baseball player (age 8-9) in a carolina blue jersey with a white number on the back, white baseball pants, blue belt, and blue cap, standing near a folding table at a baseball field with a welcoming sign-up atmosphere. Other families visible in the soft background. Bright sunny day, green field. Lifestyle sports photography, warm and inviting, 16:9 aspect ratio, ultra high resolution.",
  },
  {
    name: "hero-game-schedule",
    prompt:
      "An action shot of a youth baseball game - a young batter (age 10) at home plate mid-swing wearing a carolina blue 'Rockets' jersey and white baseball pants with blue piping, blue batting helmet. A catcher crouches behind the plate. Green baseball diamond, blue sky, sunny day. Dynamic sports photography, shallow depth of field, 16:9 aspect ratio, ultra high resolution.",
  },
  {
    name: "hero-shop-gear",
    prompt:
      "A neat display of youth baseball merchandise arranged on a table: carolina blue jerseys with white 'Rockets' script, a dark navy blue jersey, blue baseball caps with a rocket logo, a navy pinstripe zip-up hoodie with 'Rockets' embroidered, and a blue drawstring backpack. Clean product display photography, bright even lighting, 16:9 aspect ratio, ultra high resolution.",
  },
  {
    name: "hero-volunteer",
    prompt:
      "An adult baseball coach wearing a navy blue quarter-zip pullover with 'Rockets' branding, kneeling on one knee on a green baseball field, teaching batting stance to a small group of young players (ages 6-8) wearing carolina blue 'Rockets' jerseys, white pants, and blue caps. Warm community atmosphere, golden hour sunlight, 16:9 aspect ratio, ultra high resolution.",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: { name: string; url: string; error?: string }[] = [];

    for (const img of IMAGE_PROMPTS) {
      console.log(`Generating image: ${img.name}`);
      try {
        const response = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [
                {
                  role: "user",
                  content: img.prompt,
                },
              ],
              modalities: ["image", "text"],
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`AI gateway error for ${img.name}:`, response.status, errorText);
          results.push({ name: img.name, url: "", error: `AI error: ${response.status}` });
          continue;
        }

        const data = await response.json();
        const imageDataUrl =
          data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageDataUrl) {
          console.error(`No image returned for ${img.name}`);
          results.push({ name: img.name, url: "", error: "No image in response" });
          continue;
        }

        // Extract base64 data from data URL
        const base64Match = imageDataUrl.match(
          /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/
        );
        if (!base64Match) {
          results.push({ name: img.name, url: "", error: "Invalid image data format" });
          continue;
        }

        const mimeType = `image/${base64Match[1]}`;
        const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
        const base64Data = base64Match[2];

        // Decode base64 to Uint8Array
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const filePath = `${img.name}.${ext}`;

        // Upload to storage (upsert)
        const { error: uploadError } = await supabase.storage
          .from("hero-images")
          .upload(filePath, bytes, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${img.name}:`, uploadError);
          results.push({ name: img.name, url: "", error: uploadError.message });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("hero-images")
          .getPublicUrl(filePath);

        console.log(`Successfully generated and uploaded: ${img.name}`);
        results.push({ name: img.name, url: publicUrlData.publicUrl });
      } catch (imgError) {
        console.error(`Error processing ${img.name}:`, imgError);
        results.push({
          name: img.name,
          url: "",
          error: imgError instanceof Error ? imgError.message : "Unknown error",
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
