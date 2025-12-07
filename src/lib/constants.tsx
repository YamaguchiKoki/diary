import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export const SCROLL_AREA_ID = "scroll-area";

export const PROFILES = {
  twitter: {
    title: "X (Twitter)",
    username: "onurschu",
    url: "https://x.com/qnqVdT7QNA89859",
    icon: <FaXTwitter size={16} />,
  },
  github: {
    title: "GitHub",
    url: "https://github.com/YamaguchiKoki",
    icon: <FaGithub size={16} />,
  },
};

export const MOBILE_SCROLL_THRESHOLD = 20;
