import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiShieldCheckLine,
  RiArrowLeftLine,
} from "react-icons/ri";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0 },
};

export default function PrivacyPage() {
    function NavBar() {
      const [open, setOpen] = useState(false)
    
      return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">        
           <div className="flex items-center gap-3">
              <img src="/shnoor_international_logo.jpeg"  alt="SHNOOR Logo" className="w-15 h-14 object-contain rounded-lg"
              />
    
              <div>
                <h3 className="font-bold text-[#163F68] text-lg">
                  SHNOOR WorkSpace
                </h3>
    
                <p className="text-xs text-slate-600">
                  Enterprise Platform
                </p>
              </div>
            </div> 
            <div className="hidden md:flex items-center bg-[#163F68] rounded-full px-8 py-4 gap-10">
              <a href="#ho" className="text-white text-sm hover:text-[#C99232] transition">
                Home
              </a>
              <a href="#features" className="text-white text-sm hover:text-[#C99232] transition">
                Features
              </a>
              <a href="#ro" className="text-white text-sm hover:text-[#C99232] transition">
                Roles
              </a>
              <a href="#fa" className="text-white text-sm hover:text-[#C99232] transition">
                FAQ'S
              </a>
              <a href="#contact" className="text-white text-sm hover:text-[#C99232] transition">
                Contact
              </a>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-[#163F68] font-medium"
              >
                Log In
              </Link>
              <Link
                to="/register-company"
                className="px-6 py-3 rounded-lg bg-[#163F68] text-white font-semibold hover:bg-[#102D49] transition hover:text-[#C99232] transition"
              >
                Get Started
              </Link>
            </div>
            <button
              className="md:hidden text-[#163F68]"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <RiCloseLine size={24} />
              ) : (
                <RiMenuLine size={24} />
              )}
            </button>
          </div>
        </nav>
      )
    }
  return (
  <div className="min-h-screen bg-[#F7F8FA]">

    <NavBar />

    <section className="pt-40 pb-20 bg-gradient-to-b from-blue-50/60 to-white">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#163F68] mb-6"
          >
            <RiShieldCheckLine
              className="text-white"
              size={40}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .1 }}
            className="text-5xl font-extrabold text-[#163F68]"
          >
            Privacy Policy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .2 }}
            className="mt-6 text-gray-600 text-lg leading-8 max-w-3xl mx-auto"
          >
            At SHNOOR Workspace, protecting your personal information is one
            of our highest priorities. This Privacy Policy explains how we
            collect, use and safeguard your information while using our
            services.
          </motion.p>

        </div>

      </section>

      {/* Content */}

      <section className="max-w-5xl mx-auto px-6 py-16">

        {/* Back Button */}

        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-14 text-[#163F68] font-semibold hover:text-[#C99232] transition"
        >
          <RiArrowLeftLine size={20} />
          Back to Home
        </Link>

        

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Introduction
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            www.shnoor.com website is owned by SHNOOR INTERNATIONAL LLC,
            which is the data controller of your personal data.
          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            We have adopted this Privacy Policy, which determines how we are
            processing the information collected by www.shnoor.com and also
            provides the reasons why we must collect certain personal data
            about you.
          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            Therefore, you must read this Privacy Policy before using the
            SHNOOR Workspace website or services.
          </p>

          <p className="text-gray-600 leading-8 text-justify">
            We take care of your personal data and undertake to guarantee
            its confidentiality and security.
          </p>

        </motion.section>

        

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Personal Information We Collect
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            When you visit our website, we automatically collect certain
            information about your device including information about your
            web browser, IP address, time zone and cookies installed on your
            device.
          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            Additionally, as you browse the website, we collect information
            about the pages you visit, what websites or search terms referred
            you to the website and how you interact with the website.
          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            We refer to this automatically collected information as
            <strong> "Device Information"</strong>.
          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            We may also collect personal information that you voluntarily
            provide to us during registration or while using our services.
          </p>

          <ul className="list-disc pl-8 space-y-3 text-gray-600 leading-8">

            <li>First Name</li>

            <li>Last Name</li>

            <li>Email Address</li>

            <li>Phone Number</li>

            <li>Organization Details</li>

            <li>Billing Address</li>

            <li>Payment Information (when applicable)</li>

          </ul>

        </motion.section>

        

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Why Do We Process Your Data?
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            Customer data security is our highest priority. We process only
            the minimum amount of user data necessary to maintain and improve
            our services.

          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            Automatically collected information is used to identify potential
            misuse of our website, improve performance and generate
            statistical information regarding website usage.

          </p>

          <p className="text-gray-600 leading-8 text-justify">

            You can browse our website without revealing your identity.
            However, certain services require personal information such as
            registration details, customer support requests or newsletters.

          </p>

        </motion.section>

        

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Your Rights
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            If you are a European resident, you have the following rights
            regarding your personal information:

          </p>

          <ul className="list-disc pl-8 space-y-3 text-gray-600 leading-8">

            <li>The right to be informed.</li>

            <li>The right of access.</li>

            <li>The right to rectification.</li>

            <li>The right to erasure.</li>

            <li>The right to restrict processing.</li>

            <li>The right to data portability.</li>

            <li>The right to object.</li>

            <li>Rights related to automated decision making and profiling.</li>

          </ul>

        </motion.section>
                

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Links To Other Websites
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            Our website may contain links to third-party websites that are
            not owned or controlled by SHNOOR INTERNATIONAL LLC.

          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            We are not responsible for the privacy practices or content of
            any third-party websites. We encourage you to review the privacy
            policies of every website you visit.

          </p>

        </motion.section>

        {/* Information Security */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Information Security
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            We secure the information you provide on controlled computer
            servers protected from unauthorized access, use or disclosure.

          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            Appropriate administrative, technical and physical safeguards are
            maintained to protect your personal information against
            unauthorized access, modification or disclosure.

          </p>

          <p className="text-gray-600 leading-8 text-justify">

            However, no data transmission over the Internet or wireless
            network can be guaranteed to be completely secure.

          </p>

        </motion.section>

        

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Legal Disclosure
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            We may disclose any information we collect, use or receive if
            required or permitted by law, such as to comply with a subpoena
            or similar legal process.

          </p>

          <p className="text-gray-600 leading-8 text-justify">

            We may also disclose information when we believe in good faith
            that disclosure is necessary to protect our rights, ensure your
            safety or the safety of others, investigate fraud or respond to
            a government request.

          </p>

        </motion.section>

       

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Contact Information
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            If you have any questions regarding this Privacy Policy or wish
            to exercise any of your rights concerning your personal data,
            please contact us.

          </p>

          <div className="border border-slate-200 rounded-xl p-6 bg-white">

            <h3 className="text-xl font-semibold text-[#163F68] mb-3">
              SHNOOR INTERNATIONAL LLC
            </h3>

            <p className="text-gray-600 mb-2">
              Email:
            </p>

            <a
              href="mailto:info@shnoor.com"
              className="text-[#163F68] font-semibold hover:text-[#C99232] transition"
            >
              info@shnoor.com
            </a>

          </div>

        </motion.section>

      </section>

     

      <footer className="bg-[#163F68] py-8 mt-10">

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">

          <div className="flex items-center gap-3">

            <img
              src="/shnoor_international_logo.jpeg"
              alt="SHNOOR Logo"
              className="w-12 h-12 object-contain"
            />

            <div>

              <h3 className="text-white font-bold">
                SHNOOR WorkSpace
              </h3>

              <p className="text-slate-300 text-sm">
                Enterprise Platform
              </p>

            </div>

          </div>

          <p className="text-slate-300 text-sm mt-6 md:mt-0">

            © 2026 SHNOOR INTERNATIONAL LLC.
            All Rights Reserved.

          </p>

        </div>

      </footer>

    </div>
  );
}