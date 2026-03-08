"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GeneratedUI } from "./GeneratedUI";

interface A2UIComponent {
  componentType: string;
  props: Record<string, unknown>;
}

interface Props {
  components: A2UIComponent[];
  textContent: string;
  isStreaming: boolean;
}

export function PersonaResult({ components, textContent, isStreaming }: Props) {
  if (components.length === 0 && !textContent && !isStreaming) {
    return null;
  }

  return (
    <div className="mt-4">
      {/* Streaming text content */}
      {textContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-ink/80 mb-4 leading-relaxed"
        >
          {textContent}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-1.5 h-4 bg-blue-500 ml-0.5 -mb-0.5"
            />
          )}
        </motion.div>
      )}

      {/* A2UI Generated Components */}
      <AnimatePresence mode="popLayout">
        {components.map((comp, i) => (
          <motion.div
            key={`${comp.componentType}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <GeneratedUI
              componentType={comp.componentType}
              props={comp.props}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
