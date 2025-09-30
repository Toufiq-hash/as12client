import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <motion.footer
      className="footer flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-10 p-8 sm:p-10 rounded-t-3xl shadow-inner mt-10 bg-base-100"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
          <span className="text-primary">Hostel</span>
          <span className="text-secondary">Mate</span>
        </h2>
        <p className="text-base sm:text-lg text-base-content/80">
          Your trusted companion in hostel living.
        </p>
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <span className="footer-title text-lg sm:text-xl text-secondary mb-2 block">
          Quick Links
        </span>
        <nav className="flex flex-col gap-2">
          {["/", "/meals", "/dashboard"].map((path, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5, color: "#F97316" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to={path}
                className="link link-hover text-base-content text-base hover:text-secondary transition-all duration-300"
              >
                {path === "/" ? "Home" : path === "/meals" ? "Meals" : "Dashboard"}
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        viewport={{ once: true }}
        className="flex flex-col gap-4"
      >
        <div>
          <span className="footer-title text-lg sm:text-xl text-secondary mb-2 block">
            Contact
          </span>
          <nav className="flex flex-col gap-2">
            {[
              { href: "mailto:info@hostelmate.com", text: "info@hostelmate.com" },
              { href: "tel:+8801234567890", text: "+880-1234-567890" },
            ].map((contact, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 5, color: "#F97316" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <a
                  href={contact.href}
                  className="link link-hover text-base-content text-base hover:text-secondary transition-all duration-300"
                >
                  {contact.text}
                </a>
              </motion.div>
            ))}
          </nav>
        </div>

        
        <div className="flex gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-circle btn-outline hover:btn-primary"
          >
            <FaFacebook size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-circle btn-outline hover:btn-primary"
          >
            <FaLinkedin size={18} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-circle btn-outline hover:btn-primary"
          >
            <FaInstagram size={18} />
          </a>
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
