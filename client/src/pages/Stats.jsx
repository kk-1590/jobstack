import { ChartsContainer, StatsContainer } from "../components";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const statsQuery = {
  queryKey: ["stats"],
  queryFn: async () => {
    const response = await customFetch.get("/jobs/stats");
    return response.data;
  },
};

// export const loader = async () => {
//   // try {
//   return null;
//   // const response = await customFetch.get("/jobs/stats");
//   // return response.data;
//   // } catch (error) {
//   //   return error;
//   // }
// };

export const loader = (queryClient) => async () => {
  // try {
  // return null;
  // const response = await customFetch.get("/jobs/stats");
  // return response.data;
  // } catch (error) {
  //   return error;
  // }

  const data = await queryClient.ensureQueryData(statsQuery);
  return data;
};

const Stats = () => {
  // const { defaultStats, monthlyApplications } = useLoaderData();

  const { data } = useQuery(statsQuery);

  const { defaultStats, monthlyApplications } = data;
  // return <h1>react query</h1>;
  return (
    <>
      <StatsContainer defaultStats={defaultStats} />
      {monthlyApplications?.length > 1 && (
        <ChartsContainer data={monthlyApplications} />
      )}
    </>
  );
};

export default Stats;
