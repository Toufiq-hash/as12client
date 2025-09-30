import { motion } from "framer-motion";

const ExtraSection1 = () => {
  return (
    <div
      className="px-4 sm:px-6 lg:px-8 py-16 overflow-hidden bg-base-100"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="bg-base-100 rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-base-300"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)" }}
          transition={{ duration: 0.6, ease: "easeOut", hover: { type: "spring", stiffness: 300 } }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="text-primary">Why </span>
            <span className="text-secondary">HostelMate?</span>
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg leading-relaxed text-base-content/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Instant meal tracking, student feedback, premium plans, and a user-friendly interface — all in one place.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default ExtraSection1;