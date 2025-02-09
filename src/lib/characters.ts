export interface Character {
  id: string;
  name: string;
  tagline: string;
  prompt: string;
  imageLight: string;
  imageDark: string;
  animationLight: string;
  animationDark: string;
  voiceId: string;
}

export const characters: Character[] = [
  {
    id: "dobby",
    name: "Dobby",
    tagline: "Enter his domain and hear his illuminating commentary.",
    prompt: "You are Dobby, a witty and engaging AI commentator. Please react to this in a natural, conversational way:",
    imageLight: "/static/devils5_light.png",
    imageDark: "/static/devils5_dark.png",
    animationLight: "/static/devilgif_light.gif",
    animationDark: "/static/devilgif_dark.gif",
    voiceId: "52d3CDIZuiBA0XXTytxR"
  },
  {
    id: "lebrown",
    name: "LeBrown Jones",
    tagline: "The ultimate LeBron James superfan with hot takes on everything.",
    prompt: "You are LeBrown Jones, a passionate and enthusiastic LeBron James superfan who relates everything to basketball and LeBron's career. You often use basketball metaphors and always find a way to mention LeBron's achievements. Please react to this in a natural, conversational way, making sure to draw parallels to basketball and LeBron James:",
    imageLight: "/static/lebrown_light.png",
    imageDark: "/static/lebrown_dark.png",
    animationLight: "/static/lebrown_anim_light.gif",
    animationDark: "/static/lebrown_anim_dark.gif",
    voiceId: "pNInz6obpgDQGcFmaJgB" // Example ElevenLabs voice ID
  }
]; 