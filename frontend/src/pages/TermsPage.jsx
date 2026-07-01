import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiFileList3Line,
  RiArrowLeftLine,
} from "react-icons/ri";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0 },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* Hero */}

      <section className="pt-36 pb-20 bg-gradient-to-b from-blue-50/60 to-white">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <motion.div
            initial={{ opacity: 0, scale: .9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: .5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#163F68] mb-6"
          >

            <RiFileList3Line
              size={40}
              className="text-white"
            />

          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .1 }}
            className="text-5xl font-extrabold text-[#163F68]"
          >
            Terms & Conditions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .2 }}
            className="mt-6 text-gray-600 text-lg leading-8 max-w-3xl mx-auto"
          >

            Please read these Terms and Conditions carefully before
            accessing or using SHNOOR Workspace.

          </motion.p>

        </div>

      </section>

      {/* Content */}

      <section className="max-w-5xl mx-auto px-6 py-16">

        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-14 text-[#163F68] font-semibold hover:text-[#C99232] transition"
        >

          <RiArrowLeftLine size={20} />

          Back to Home

        </Link>

        {/* Welcome */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">

            Welcome

          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            Welcome to <strong>www.shnoor.com</strong>.

          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            These Terms and Conditions outline the rules and regulations
            for the use of SHNOOR INTERNATIONAL'S Website located at
            https://www.shnoor.com.

          </p>

          <p className="text-gray-600 leading-8 text-justify">

            By accessing this website, we assume you accept these Terms
            and Conditions. Do not continue to use www.shnoor.com if you
            do not agree to all the Terms and Conditions stated on this page.

          </p>

        </motion.section>

        {/* Cookies */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration:.5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">

            Cookies

          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            The website uses cookies to help personalize your online
            experience. By accessing www.shnoor.com, you agree to use
            the required cookies.

          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            A cookie is a text file placed on your device by a web server.
            Cookies cannot be used to run programs or deliver viruses.

          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            We may use cookies to collect, store and track information
            for statistical and marketing purposes in order to improve
            our website and services.

          </p>

          <p className="text-gray-600 leading-8 text-justify">

            Some cookies are essential for the operation of the website
            and do not require consent. Third-party cookies may also be
            used when third-party services are integrated into our website.

          </p>

        </motion.section>

        {/* License */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once:true }}
          transition={{ duration:.5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">

            License

          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            Unless otherwise stated, SHNOOR INTERNATIONAL and/or its
            licensors own the intellectual property rights for all
            material on www.shnoor.com.

          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            All intellectual property rights are reserved. You may access
            this website for your personal use subject to the restrictions
            described in these Terms and Conditions.

          </p>

          <h3 className="text-2xl font-semibold text-[#163F68] mb-5">

            You Must Not

          </h3>

          <ul className="list-disc pl-8 space-y-3 text-gray-600 leading-8">

            <li>Copy or republish material from www.shnoor.com.</li>

            <li>Sell, rent or sub-license material from www.shnoor.com.</li>

            <li>Reproduce, duplicate or copy website material.</li>

            <li>Redistribute content from www.shnoor.com.</li>

          </ul>

          <p className="text-gray-600 leading-8 text-justify mt-6">

            This Agreement shall begin on the date you first access
            this website.

          </p>

        </motion.section>
                {/* User Comments */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            User Comments
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            Parts of this website offer users an opportunity to post and
            exchange opinions and information. SHNOOR INTERNATIONAL does
            not filter, edit, publish or review comments before they appear
            on the website.

          </p>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            Comments do not reflect the views or opinions of SHNOOR
            INTERNATIONAL, its employees or affiliates. The opinions
            expressed belong solely to the person posting them.

          </p>

          <p className="text-gray-600 leading-8 text-justify">

            To the extent permitted by law, SHNOOR INTERNATIONAL shall not
            be liable for comments or any damages resulting from their use
            or publication.

          </p>

        </motion.section>

        {/* User Responsibilities */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Your Responsibilities
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            By posting comments or content on our website, you warrant
            and represent that:

          </p>

          <ul className="list-disc pl-8 space-y-3 text-gray-600 leading-8">

            <li>
              You have all required permissions and licenses to publish the content.
            </li>

            <li>
              Your content does not infringe any copyright, trademark,
              patent or other intellectual property rights.
            </li>

            <li>
              Your content is not defamatory, offensive, unlawful,
              obscene or invasive of privacy.
            </li>

            <li>
              Your content will not be used for unlawful or commercial
              solicitation.
            </li>

          </ul>

          <p className="text-gray-600 leading-8 text-justify mt-6">

            By posting comments, you grant SHNOOR INTERNATIONAL a
            non-exclusive license to use, reproduce, edit and authorize
            others to use such content in any media.

          </p>

        </motion.section>

        {/* Hyperlinking */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Hyperlinking To Our Content
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            The following organizations may link to our website without
            prior written approval:

          </p>

          <ul className="list-disc pl-8 space-y-3 text-gray-600 leading-8">

            <li>Government agencies.</li>

            <li>Search engines.</li>

            <li>News organizations.</li>

            <li>Online directory distributors.</li>

            <li>Accredited businesses.</li>

          </ul>

          <p className="text-gray-600 leading-8 text-justify mt-6">

            These organizations may link to our website provided the
            link is not misleading, does not imply sponsorship and
            fits naturally within the linking website.

          </p>

        </motion.section>

        {/* Additional Link Requests */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Additional Link Requests
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">

            We may also consider approving link requests from commonly
            known consumer information sources, internet portals,
            educational institutions, trade associations, consulting
            firms and similar organizations.

          </p>

          <p className="text-gray-600 leading-8 text-justify">

            Requests will be evaluated based on relevance, reputation
            and whether the hyperlink benefits both parties.

          </p>

        </motion.section>

        {/* Logo Usage */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >

          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Logo Usage
          </h2>

          <p className="text-gray-600 leading-8 text-justify">

            No use of SHNOOR INTERNATIONAL'S logo, branding or artwork
            shall be permitted without prior written trademark
            authorization.

          </p>

        </motion.section>
                {/* Content Liability */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Content Liability
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            We shall not be held responsible for any content that appears
            on your website. You agree to protect and defend SHNOOR
            INTERNATIONAL against all claims that arise from content
            published on your website.
          </p>

          <p className="text-gray-600 leading-8 text-justify">
            No link should appear on any website that may be interpreted
            as defamatory, obscene, unlawful or infringing upon the rights
            of any third party.
          </p>
        </motion.section>

        {/* Reservation of Rights */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Reservation of Rights
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            We reserve the right to request that you remove any or all
            links to our website. You agree to immediately remove all
            requested links upon notice.
          </p>

          <p className="text-gray-600 leading-8 text-justify">
            We also reserve the right to amend these Terms and Conditions
            and our linking policy at any time. By continuing to use our
            website, you agree to be bound by the latest version of these
            Terms and Conditions.
          </p>
        </motion.section>

        {/* Removal of Links */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Removal of Links
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            If you find any link on our website that you believe is
            offensive or inappropriate, you may contact us at any time.
          </p>

          <p className="text-gray-600 leading-8 text-justify">
            While we will consider requests to remove links, we are under
            no obligation to do so or to respond directly to every request.
          </p>
        </motion.section>

        {/* Disclaimer */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Disclaimer
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            To the maximum extent permitted by applicable law, we exclude
            all representations, warranties and conditions relating to
            this website and its use.
          </p>

          <ul className="list-disc pl-8 space-y-3 text-gray-600 leading-8 mb-6">
            <li>
              Nothing shall limit or exclude liability for death or
              personal injury.
            </li>

            <li>
              Nothing shall limit or exclude liability for fraud or
              fraudulent misrepresentation.
            </li>

            <li>
              Nothing shall limit liabilities in any way not permitted
              under applicable law.
            </li>

            <li>
              Nothing shall exclude liabilities that may not legally be
              excluded.
            </li>
          </ul>

          <p className="text-gray-600 leading-8 text-justify">
            As long as the website and the information and services are
            provided free of charge, SHNOOR INTERNATIONAL will not be
            liable for any loss or damage of any nature arising from the
            use of this website.
          </p>
        </motion.section>

        {/* Contact */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-[#163F68] mb-6">
            Contact Information
          </h2>

          <p className="text-gray-600 leading-8 text-justify mb-6">
            If you have any questions regarding these Terms and Conditions,
            please contact us.
          </p>

          <a
            href="mailto:info@shnoor.com"
            className="text-[#163F68] font-semibold text-lg hover:text-[#C99232] transition"
          >
            info@shnoor.com
          </a>
        </motion.section>

      </section>

      {/* Footer */}

      <footer className="bg-[#163F68] py-8">
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

          <p className="text-slate-300 text-sm mt-5 md:mt-0">
            © 2026 SHNOOR INTERNATIONAL LLC. All Rights Reserved.
          </p>

        </div>
      </footer>

    </div>
  );
}