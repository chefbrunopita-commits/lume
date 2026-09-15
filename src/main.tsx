import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChatApp } from "@/components/chat/chat-app";
import "@/styles.css";
createRoot(document.getElementById("root")!).render(<StrictMode><ChatApp /></StrictMode>);
