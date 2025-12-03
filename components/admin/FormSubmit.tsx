interface SubmitButtonProps {
    pageType: string;
    isSubmitting: boolean;
  }
  
  export function SubmitButton({ pageType, isSubmitting }: SubmitButtonProps) {
    const getButtonText = () => {
      if (isSubmitting) return 'Submitting...';
      
      switch (pageType) {
        case 'register':
          return 'Register';
        case 'contact_us':
          return 'Send Message';
        case 'login':
          return 'Login';
        default:
          return 'Submit';
      }
    };
  
    return (
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {getButtonText()}
      </button>
    );
  }