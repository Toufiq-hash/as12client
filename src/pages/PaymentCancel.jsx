import { Link } from "react-router-dom";

const PaymentCancel = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-error/10 dark:bg-error-dark/20">
      <div className="bg-base-100 dark:bg-base-100-dark p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-4xl font-bold text-error dark:text-error-dark mb-4">Payment Canceled</h1>
        <p className="text-lg mb-6 text-base-content dark:text-base-content-dark">
          Your payment was not completed. If this was a mistake, please try again.
        </p>
        <Link
          to="/checkout"
          className="btn bg-error/20 dark:bg-error-dark/50 text-error dark:text-error-dark border border-error dark:border-error-dark hover:bg-error/30 dark:hover:bg-error-dark/60 shadow-sm hover:shadow-md transition-all duration-200"
        >
          Retry Payment
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;