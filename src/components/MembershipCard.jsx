import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MembershipCard = ({ name, price }) => {
  return (
    <motion.div
      className="relative max-w-md mx-auto rounded-3xl"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="bg-base-100 rounded-3xl shadow-2xl p-10 text-center">
        <h2 className="text-4xl font-extrabold">
          <span className="text-primary">{name}</span>
          <span className="text-secondary"> Package</span>
        </h2>
        <p className="text-3xl font-semibold text-secondary mt-4">${price}</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
          <Link
            to={`/checkout/${name.toLowerCase()}`}
            className="btn btn-primary text-white font-semibold rounded-full w-full py-3 shadow-lg hover:bg-primary/90 transition"
            aria-label={`Buy ${name} package now`}
            onClick={() => console.log(`Navigating to /checkout/${name.toLowerCase()}`)}
          >
            Buy Now
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MembershipCard;