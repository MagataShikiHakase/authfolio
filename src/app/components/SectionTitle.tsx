// components/SectionTitle.tsx
"use client"
import { motion } from "framer-motion"

export default function SectionTitle({ title }: { title: string }) {
  return (
    <motion.h2
      className="text-4xl font-bold text-center my-12 shiny-text"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.6 }}
    >
      {title}
    </motion.h2>
  )
}
