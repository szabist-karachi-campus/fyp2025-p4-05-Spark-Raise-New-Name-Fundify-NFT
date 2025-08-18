import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import { nft } from "../assets";
import { punk } from "../assets";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* First Section with Fixed Background */}
      <div className="relative isolate overflow-hidden min-h-screen max-w-screen flex flex-col justify-center py-24 sm:py-32 transition-all duration-500">
        {/* Fixed Background with Animation */}
        <div
          className="fixed inset-0 -z-10 h-full w-full bg-gradient-to-br from-gray-900 to-gray-800 opacity-90 animate-gradient"
          style={{
            animation: "gradientAnimation 10s ease infinite",
          }}
        ></div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-5xl font-bold tracking-tight text-white sm:text-7xl transition-all duration-500 hover:text-green-500 animate-text">
              Join the moment
            </h2>
            <p className="mt-8 text-lg font-medium text-gray-300 sm:text-xl/8 transition-all duration-500 hover:text-green-400 animate-text">
              Empowering creators and backers with secure, transparent, and
              borderless crowdfunding on Polygon.
            </p>
          </div>
        </div>
      </div>

      {/* Rest of the Content */}
      <div className="relative z-10 bg-gray-900">
        {/* Crowdfunding Info Section */}
        <section className="container mx-auto px-20 pb-40 pt-10 text-center sm:px-12 transition-all duration-500">
          <h1 className="mb-12 text-5xl font-bold leading-tight text-white sm:text-6xl transition-all duration-500 hover:text-green-500 animate-text">
            Get funding for your creative and charity projects.
          </h1>
          <p className="leading-relaxed text-gray-300 transition-all duration-500 hover:text-green-400 animate-text">
            FundifyNFTs provides access to fast and secure financing solutions for
            raising funds. <br />
            We connect projects with a community of backers to support growth
            through crowdfunding.
          </p>
        </section>

        <hr className="border-gray-700 sm:mx-auto lg:my-8 transition-all duration-500" />

        {/* NFT Section */}
        <section className="container mx-auto flex flex-col items-center px-8 py-70 sm:flex-row-reverse sm:px-12 transition-all duration-500">
          <div className="mb-8 w-full sm:mb-0 sm:w-1/2 sm:pl-4 md:pl-16">
            <img
              alt="NFT"
              className="rounded-lg shadow-lg transition-all duration-500 hover:scale-105"
              src={nft}
            />
          </div>
          <div className="mr-4 w-full text-center sm:w-1/2 sm:text-left">
            <h1 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl transition-all duration-500 hover:text-green-500 animate-text">
              ONE STOP for buying and selling NFTs.
            </h1>
            <p className="mb-2 leading-relaxed text-gray-300 transition-all duration-500 hover:text-green-400 animate-text">
              A fast marketplace for buying and selling NFTs with low gas fees.
            </p>
            <ul className="mb-8 flex list-inside list-disc flex-col items-center space-y-1 text-gray-300 sm:items-start transition-all duration-500 hover:text-green-400 animate-text">
              <li>Secure</li>
              <li>Built on Polygon MATIC</li>
              <li>Fast</li>
            </ul>
            <div className="flex flex-col space-y-3 md:flex-row md:space-x-2 md:space-y-0">
              <button className="rounded-lg bg-green-700 px-6 py-3 text-base text-white transition-all duration-500 hover:bg-green-600">
                Explore services
              </button>
            </div>
          </div>
        </section>

        <hr className="border-gray-700 sm:mx-auto lg:my-8 transition-all duration-500" />

        {/* Testimonial Section */}
        <p className="py-5 text-center text-2xl text-white transition-all duration-500 hover:text-green-500 animate-text">
          Testimonial
        </p>

        <blockquote className="flex flex-col items-center p-4 transition-all duration-500">
          <p className="max-w-4xl text-left text-xl text-white sm:text-2xl lg:text-3xl transition-all duration-500 hover:text-green-400 animate-text">
            "FundifyNFTs made it incredibly easy to raise funds for my project.
            The platform connected me with enthusiastic backers, and the NFT
            integration added a unique way to reward my supporters. I couldn’t
            have launched without their support – highly recommend for any creator
            or entrepreneur!"
          </p>
          <section className="mt-6 flex items-center gap-3 sm:mt-12">
            <img
              className="h-12 w-12 flex-shrink-0 rounded-full border border-black/10 transition-all duration-500 hover:scale-110"
              src="https://loremflickr.com/g/200/200/girl"
              alt="Jane Doe"
              loading="lazy"
            />
            <a href="#" target="_blank" className="inline-block font-bold tracking-tight">
              <p className="text-white transition-all duration-500 hover:text-green-500 animate-text">Jane Doe</p>
              <p className="font-medium text-gray-400 transition-all duration-500 hover:text-green-400 animate-text">
                Founder of Polymarket
              </p>
            </a>
          </section>
        </blockquote>

        <hr className="border-gray-700 sm:mx-auto lg:my-8 transition-all duration-500" />

        {/* Accordion Section */}
        <div className="mx-auto mt-24 max-w-lg">
          <p className="py-5 text-center text-2xl text-white transition-all duration-500 hover:text-green-500 animate-text">
            Frequently Asked Questions
          </p>

          <div className="divide-y divide-gray-700">
            {[
              {
                question: "How does crowdfunding work on FundifyNFTs?",
                answer:
                  "On FundifyNFTs, you create a campaign, set a funding goal, and offer NFTs as rewards. Backers can support your project, and once the goal is met, you receive the funds.",
              },
              {
                question: "What types of projects can I fund on FundifyNFTs?",
                answer:
                  "You can fund a variety of projects, from creative ventures like art and books to charity, all powered by Polygon MATIC blockchain.",
              },
              {
                question: "Is there a fee for using FundifyNFTs?",
                answer:
                  "No, there are no fees required to use FundifyNFTs. We believe in supporting creators and entrepreneurs without extra costs.",
              },
            ].map((faq, index) => (
              <details key={index} className="group transition-all duration-500">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg text-white transition-all duration-500 hover:text-green-500 animate-text">
                  {faq.question}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-5 w-5 transition-all duration-500 group-open:hidden"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="hidden h-5 w-5 transition-all duration-500 group-open:block"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 12h-15"
                    />
                  </svg>
                </summary>
                <div className="pb-4 text-gray-300 transition-all duration-500 hover:text-green-400 animate-text">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        <hr className="border-gray-700 sm:mx-auto lg:my-8 transition-all duration-500" />

        {/* About Section */}
        <div className="container mx-auto flex flex-col items-center px-8 py-20 sm:flex-row sm:px-12 transition-all duration-500">
          <div className="sm:w-1/2 p-10">
            <img
              src="https://i.imgur.com/WbQnbas.png"
              alt="About Us"
              className="rounded-lg shadow-lg transition-all duration-500 hover:scale-105"
            />
          </div>
          <div className="sm:w-1/2 p-5">
            <h2 className="my-4 text-3xl font-bold text-white sm:text-4xl transition-all duration-500 hover:text-green-500 animate-text">
              About <span className="text-green-500">Our Company</span>
            </h2>
            <p className="text-gray-300 transition-all duration-500 hover:text-green-400 animate-text">
              FundifyNFTs is a crowdfunding and NFT marketplace where creators
              and businesses can raise money directly from supporters. Our
              platform uses blockchain to make funding easy, secure, and
              transparent. With FundifyNFT, users can buy and sell unique
              digital assets (NFTs) and connect with people who want to back
              their projects and help them grow.
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="w-full bg-gray-800 text-gray-400">
  <div className="max-w-7xl mx-auto px-6 py-10 md:flex md:items-center md:justify-between">
    {/* Logo / Brand */}
    <div className="mb-6 md:mb-0">
      <a
        href="#"
        className="flex items-center space-x-3 text-white hover:text-green-500 transition-all duration-300"
      >
        <span className="self-center text-2xl font-bold whitespace-nowrap">
          FUNDIFYNFT
        </span>
      </a>
    </div>
  </div>

  <div className="border-t border-gray-700 py-4">
    <p className="text-center text-sm text-gray-500 hover:text-green-400 transition duration-300">
      © 2024 <a href="#" className="hover:underline">FUNDIFYNFT</a>. All Rights Reserved.
    </p>
  </div>
</footer>

      </div>

      {/* Add CSS for Background Animation */}
      <style>
        {`
          @keyframes gradientAnimation {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradientAnimation 10s ease infinite;
          }
          @keyframes textAnimation {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-text {
            animation: textAnimation 1s ease-out;
          }
        `}
      </style>
    </>
  );
};

export default Home;