import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-secondary/10 dark:bg-secondary-dark/20">
      <div className="bg-base-100 dark:bg-base-100-dark p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-4xl font-bold text-secondary dark:text-secondary-dark mb-4">Payment Successful!</h1>
        <p className="text-lg mb-6 text-base-content dark:text-base-content-dark">
          Thank you for your payment. Your booking/order has been confirmed.
        </p>
        <Link
          to="/dashboard/bookings"
          className="btn bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark border border-primary dark:border-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 shadow-sm hover:shadow-md transition-all duration-200"
        >
          Go to My Bookings
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;