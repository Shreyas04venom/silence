interface TopicAssetInput {
  topic: string
  chapter?: string
  subject?: string
  standard?: string
}

interface TopicAssetEntry {
  keywords: string[]
  imageUrl?: string
  animationUrl?: string
}

export interface TopicAssetMatch {
  imageUrl: string | null
  animationUrl: string | null
}

const TOPIC_ASSET_ENTRIES: TopicAssetEntry[] = [
  {
    keywords: ["nutrition in plants", "plant nutrition"],
    imageUrl: "/content/std-6/science/basic-life-processes/nutrition-in-plants/image-1-photosynthesis-process.png",
    animationUrl: "/content/std-6/science/basic-life-processes/nutrition-in-plants/animation-photosynthesis.html",
  },
  {
    keywords: ["nutrition in animals", "animal nutrition"],
    imageUrl: "/content/std-6/science/basic-life-processes/nutrition-in-animals/image-1-nutrition-in-animals.png",
    animationUrl: "/content/std-6/science/basic-life-processes/nutrition-in-animals/animation-nutrition-in-animals.html",
  },
  {
    keywords: ["respiration", "breathing"],
    imageUrl: "/content/std-6/science/basic-life-processes/respiration/image-1-respiration.png",
    animationUrl: "/content/std-6/science/basic-life-processes/respiration/animation-breathing-cycle.html",
  },
  {
    keywords: ["structure of plants", "plant structure", "plant anatomy"],
    imageUrl: "/content/std-6/science/living-organisms/structure-of-plants/image-1-structure-of-plants.png",
    animationUrl: "/content/std-6/science/living-organisms/structure-of-plants/animation-plant-anatomy.html",
  },
  {
    keywords: ["structure of animals", "animal structure", "animal cell"],
    imageUrl: "/content/std-6/science/living-organisms/structure-of-animals/image-1-structure-of-animals.png",
    animationUrl: "/content/std-6/science/living-organisms/structure-of-animals/animation-animal-cell.html",
  },
  {
    keywords: ["natural numbers", "natural number"],
    imageUrl: "/content/std-6/mathematics/numbers/natural-numbers/image-1-natural-numbers.png",
    animationUrl: "/content/std-6/mathematics/numbers/natural-numbers/animation-number-line.html",
  },
  {
    keywords: ["whole numbers", "whole number"],
    imageUrl: "/content/std-6/mathematics/numbers/whole-numbers/image-1-whole-numbers.png",
    animationUrl: "/content/std-6/mathematics/numbers/whole-numbers/animation-whole-numbers.html",
  },
  {
    keywords: ["digestive system", "digestion", "digestive"],
    imageUrl: "/content/std-7/science/human-body/digestive-system/image-1-digestive-journey.png",
    animationUrl: "/content/std-7/science/human-body/digestive-system/animation-digestive-journey.html",
  },
  {
    keywords: ["skeletal system", "skeleton", "skeletal", "bones"],
    imageUrl: "/content/std-7/science/human-body/skeletal-system/image-1-skeletal-system.png",
    animationUrl: "/content/std-7/science/human-body/skeletal-system/animation-skeleton.html",
  },
  {
    keywords: ["photosynthesis"],
    imageUrl: "/content/std-7/science/life-processes/photosynthesis/image-1-photosynthesis.png",
    animationUrl: "/content/std-7/science/life-processes/photosynthesis/animation-photosynthesis.html",
  },
  {
    keywords: ["reproduction in animals", "animal reproduction"],
    animationUrl: "/content/std-7/science/life-processes/reproduction-animals/animation-reproduction-animals.html",
  },
  {
    keywords: ["reproduction in plants", "plant reproduction"],
    animationUrl: "/content/std-7/science/life-processes/reproduction-plants/animation-reproduction-plants.html",
  },
  {
    keywords: ["equations", "equation", "algebraic equation"],
    imageUrl: "/content/std-7/mathematics/algebra/equations/image-1-equations.png",
    animationUrl: "/content/std-7/mathematics/algebra/equations/animation-equations-balance.html",
  },
  {
    keywords: ["variables", "variable"],
    imageUrl: "/content/std-7/mathematics/algebra/variables/image-1-variables.png",
    animationUrl: "/content/std-7/mathematics/algebra/variables/animation-variables.html",
  },
  {
    keywords: ["quadrilaterals", "quadrilateral"],
    animationUrl: "/content/std-8/mathematics/geometry/quadrilaterals/animation-quadrilaterals.html",
  },
  {
    keywords: ["triangles", "triangle"],
    imageUrl: "/content/std-8/mathematics/geometry/triangles/image-1-triangles.png",
    animationUrl: "/content/std-8/mathematics/geometry/triangles/animation-triangle-types.html",
  },
  {
    keywords: ["ecosystems", "ecosystem"],
    animationUrl: "/content/std-8/science/ecology/ecosystems/animation-ecosystems.html",
  },
  {
    keywords: ["food chain", "food web"],
    imageUrl: "/content/std-8/science/ecology/food-chain/image-1-food-chain.png",
    animationUrl: "/content/std-8/science/ecology/food-chain/animation-food-chain.html",
  },
  {
    keywords: ["circulatory system", "blood circulation", "circulatory", "heart"],
    imageUrl: "/content/std-8/science/life-processes-in-living-organisms/circulatory-system/image-1-circulatory-system.png",
    animationUrl: "/content/std-8/science/life-processes-in-living-organisms/circulatory-system/animation-circulation.html",
  },
  {
    keywords: ["human digestive system"],
    animationUrl: "/content/std-8/science/life-processes-in-living-organisms/human-digestive-system/animation-human-digestive-system.html",
  },
  {
    keywords: ["nervous system", "nerves", "brain and nerves"],
    animationUrl: "/content/std-8/science/life-processes-in-living-organisms/nervous-system/animation-nervous-system.html",
  },
]

function normalize(input: TopicAssetInput): string {
  return [input.topic, input.chapter, input.subject, input.standard]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

export function resolveTopicAssets(input: TopicAssetInput): TopicAssetMatch {
  const haystack = normalize(input)

  for (const entry of TOPIC_ASSET_ENTRIES) {
    if (entry.keywords.some((keyword) => haystack.includes(keyword))) {
      return {
        imageUrl: entry.imageUrl ?? null,
        animationUrl: entry.animationUrl ?? null,
      }
    }
  }

  return {
    imageUrl: null,
    animationUrl: null,
  }
}
