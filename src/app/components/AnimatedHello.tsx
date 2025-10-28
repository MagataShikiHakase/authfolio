// components/AnimatedHello.tsx
"use client"
import { motion } from "framer-motion"

const text = "Hello."

const letter = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function AnimatedHello() {
  return (
    <motion.h1
      className="text-6xl font-bold text-center"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.4 } },
      }}
      initial="hidden"
      animate="visible"
    >
      {text.split("").map((char, i) => (
        <motion.span key={i} variants={letter}>
          {char}
        </motion.span>
      ))}
    </motion.h1>
  )
}
