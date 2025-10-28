// components/SectionDivider.tsx
"use client"
import { motion } from "framer-motion"

export default function SectionDivider() {
  return (
    <motion.div
      className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent my-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      viewport={{ once: true }}
    />
  )
}
