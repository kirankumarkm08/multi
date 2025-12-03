"use client";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/lib/api";
import { PageRenderer } from "@/components/page-renderer/page-renderer";
import Error from "@/components/common/Error";
import Loading from "@/components/common/Loading";

export default function LandingPage() {
  const {
    data: landingPageData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["landingPage"],
    queryFn: async () => {
      const response = await customerApi.getLandingPage();
      if (!response) {
        throw new Error("No landing page found");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  console.log("landingkkkkkkkkkkkkkkk", landingPageData);

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load landing page";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Failed to Load Landing Page
          </h2>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <Error error={errorMessage} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageRenderer layoutId="landing-page" landingPageData={landingPageData} />
    </div>
  );
}
