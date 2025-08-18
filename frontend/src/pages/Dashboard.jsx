import MyCampaigns from "../components/MyCampaigns";

const DashboardPage = () => {
  return (
    <div className="font-epilogue">
      <h1 className="font-epilogue font-semibold text-[18px] text-left text-black dark:text-white">
        Hello! Welcome to your dashboard.
      </h1>
      <MyCampaigns />
    </div>
  );
};

export default DashboardPage;
