export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  assetCount: number;
  featured?: boolean;
  image?: string;
  popularModels?: string[];
}

export interface LocationHub {
  id: string;
  city: string;
  state: string;
  code: string;
  activeMachineryCount: number;
  popular?: boolean;
}
