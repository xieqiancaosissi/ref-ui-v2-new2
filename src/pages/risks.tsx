import React, { useState, useEffect, useRef } from "react";
import { ExternalLinkIcon } from "@/components/common/Icons";
import { openUrl } from "../services/commonV3";
import styles from "@/components/risks/risks.module.css";
import {
  AuditsIcon,
  AdminKeysIcon,
  RugPullIcon,
  DivergenceLossIcon,
  StakingRisksIcon,
  PegIcon,
  SystemicIssuesIcon,
  CryptoTradingAddictionIcon,
  ThirdPartyWalletIcon,
  RightTopIcon,
} from "@/components/risks/Icons";

export default function RiskPage() {
  return (
    <div className={styles.riskBg}>
      <div className="w-1/2 mx-auto pt-24 relative xs:w-11/12 md:w-11/12">
        <div className="flex items-center justify-center gap-1 text-xl font-extrabold">
          <span className="text-primaryGreen">Risks</span>{" "}
          <span className="text-xl text-transparent bg-textWhiteGradient bg-clip-text">
            of Using Ref. finance
          </span>{" "}
        </div>
        <p
          style={{ fontSize: "13px" }}
          className=" text-gray-190 text-center mt-6"
        >
          Providing liquidity and/or trading on Ref Finance do not come without
          risks. Before interacting with the protocol, please do research and
          understand the risks involved.
        </p>
        <div className="flex items-center justify-center gap-6 mt-10">
          <div
            className={styles.exButton}
            onClick={() => {
              openUrl(
                "https://form.typeform.com/to/EPmUetxU?typeform-source=mzko2gfnij6.typeform.com"
              );
            }}
          >
            General Risks Quiz
            <ExternalLinkIcon />
          </div>
          <div
            className={styles.exButton}
            onClick={() => {
              openUrl("https://uniswap.org/whitepaper.pdf");
            }}
          >
            AMM Core Design
            <ExternalLinkIcon />
          </div>
        </div>
        <div className={styles.wrapBox}>
          <AuditsIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>Audits</span>
            <div className={styles.wrapBoxContent}>
              <p>
                Ref Finance smart contracts have been{" "}
                <a
                  className="underline hover:text-white"
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                  href="https://guide.ref.finance/developers/audits"
                >
                  audited
                </a>
                .{" "}
              </p>
              Security audits do not eliminate risks completely. Please do not
              supply your life savings, or assets you cannot afford to lose, to
              Ref Finance, especially as a liquidity provider.
            </div>
          </div>
        </div>
        <div className={styles.wrapBox}>
          <AdminKeysIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>Admin keys</span>
            <div className={styles.wrapBoxContent}>
              Ref Finance is managed by the{" "}
              <a
                rel="noopener noreferrer nofollow"
                className="underline hover:text-white"
                target="_blank"
                href="https://app.astrodao.com/dao/ref-finance.sputnik-dao.near"
              >
                Ref Finance Sputnik DAO
              </a>{" "}
              and will be transitioning to a fully decentralized DAO. For more
              information relating to the contracts and addresses that have
              directly managed or currently manage the affairs of Ref Finance,
              please check our
              <a
                className="underline hover:text-white"
                rel="noopener noreferrer nofollow"
                target="_blank"
                href="https://guide.ref.finance/developers/contracts"
              >
                Documentation
              </a>
              .
            </div>
          </div>
        </div>
        <div className={styles.wrapBox}>
          <RugPullIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>Rug pull</span>
            <div className={styles.wrapBoxContent}>
              If the team behind a token, either whitelisted or not, decides to
              abandon its project and takes the investors’ money, the project’s
              token will probably be worth $0. If the token is whitelisted on
              Ref Finance, that does not mean the project will succeed. You are
              responsible for doing your own due diligence of the project and
              should understand that crypto are very-high risk, speculative
              investments. You should be aware and prepared to potentially lose
              some or all of the money invested.
            </div>
          </div>
        </div>
        <div className={styles.wrapBox}>
          <DivergenceLossIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>Divergence Loss</span>
            <div className={styles.wrapBoxContent}>
              If you provide liquidity, please do note that you can make more
              money by not providing liquidity. Divergence Loss is often yet
              inappropriately called “impermanent loss”. The adjective
              (impermanent) may assume or create the marketing feeling that
              losses are only impermanent, meaning that losses are guaranteed to
              be reversed, which is not true.
              <div
                className="flex items-center gap-1 hover:text-white cursor-pointer mt-4"
                onClick={() => {
                  openUrl(
                    "https://pintail.medium.com/uniswap-a-good-deal-for-liquidity-providers-104c0b6816f2"
                  );
                }}
              >
                Learn more about Divergence Loss <RightTopIcon />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.wrapBox}>
          <StakingRisksIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>Staking risks</span>
            <div className={styles.wrapBoxContent}>
              When staking you use multiple smart contract products each of
              which has its own risks.
            </div>
          </div>
        </div>
        <div className={styles.wrapBox}>
          <PegIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>Permanent loss of a peg</span>
            <div className={styles.wrapBoxContent}>
              If one of the stablecoins in the pool goes significantly down
              below the peg of 1.0 and never returns to the peg, it will
              effectively mean that pool liquidity providers hold almost all
              their liquidity in that currency.
            </div>
          </div>
        </div>
        <div className={styles.wrapBox}>
          <SystemicIssuesIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>Systemic issues</span>
            <div className={styles.wrapBoxContent}>
              In general, DeFi or the legos of money is highly connected,
              meaning that one failure of its component may trigger a succession
              of failures. A systematic risk means that you can lose money even
              if the failure does not directly concern your investment/exposure.{" "}
              <p>
                The following risks may have an impact in the liquidity pools:{" "}
              </p>
              <p>- Smart contract issues with lending protocols</p>{" "}
              <p>- Smart contracts issues with staking protocols</p>{" "}
              <p>- Systemic issues with the stablecoins in those pools</p>{" "}
              <p>- Systemic issues with ERC20-native tokens in those pools</p>
            </div>
          </div>
        </div>
        <div className={styles.wrapBox}>
          <CryptoTradingAddictionIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>
              Crypto trading addiction
            </span>
            <div className={styles.wrapBoxContent}>
              Trading crypto can be very addictive and, according to many
              sources, be a form of gambling addiction, which can destroy lives.
              Please find below a collection of stories relating to that matter.
              <p
                className="flex items-center gap-2 hover:text-white cursor-pointer underline mt-4"
                onClick={() => {
                  openUrl(
                    "https://www.theguardian.com/technology/2022/jan/15/trading-is-gambling-no-doubt-about-it-how-cryptocurrency-dealing-fuels-addiction"
                  );
                }}
              >
                'Trading is gambling, no doubt about it' <RightTopIcon />
              </p>
              <p
                className="flex items-center gap-2 hover:text-white cursor-pointer underline mt-3"
                onClick={() => {
                  openUrl(
                    "https://www.vice.com/en/article/bvzz9a/i-lost-half-a-million-pounds-bitcoin"
                  );
                }}
              >
                {" "}
                'I Lost Half a Million Pounds Trading Bitcoin'
                <RightTopIcon />
              </p>
              <p
                className="flex items-center gap-2 hover:text-white cursor-pointer underline mt-3"
                onClick={() => {
                  openUrl(
                    "https://www.vice.com/en/article/8xe8jv/cryptocurrency-trading-addiction-gambling-castle-craig"
                  );
                }}
              >
                {" "}
                'We Spoke to a Therapist Who Treats Cryptocurrency Trading
                Addiction'
                <RightTopIcon />
              </p>
              <p
                className="flex items-center gap-2 hover:text-white cursor-pointer underline mt-3"
                onClick={() => {
                  openUrl("https://www.bbc.co.uk/news/uk-scotland-57268024");
                }}
              >
                {" "}
                'I lost millions through cryptocurrency trading addiction'
                <RightTopIcon />
              </p>
            </div>
          </div>
        </div>
        <div className={styles.wrapBox}>
          <ThirdPartyWalletIcon />
          <div className="flex flex-col gap-3">
            <span className={styles.wrapBoxTitle}>Third-party wallet</span>
            <div className={styles.wrapBoxContent}>
              <p>Ref Finance integrates third-party wallets.</p>
              <p>
                While we have taken measures to select wallet providers, we
                cannot guarantee their security or performance. You should
                familiarize yourself with the risks associated with the specific
                wallet provider and understand their terms of service, privacy
                policy, and security practices.
              </p>
              <p>
                Please use these services at your own risk and exercise caution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
