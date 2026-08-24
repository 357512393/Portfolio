import { useEffect, useState } from "react";
import SlashHoverLabel from "./SlashHoverLabel";

export default function AboutPage({ onClose, onOpenPhotography }) {
  const [navEntering, setNavEntering] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setNavEntering(false));
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  const reveal = (content, className = "", immediate = false) => (
    <span className={`about-reveal${className ? ` ${className}` : ""}`}>
      <span style={immediate ? { animation: "none", opacity: 1 } : undefined}>{content}</span>
    </span>
  );

  return (
    <section className="about-page is-revealing" aria-label="关于">
      <header className="about-page__header">
        <nav className={`site-nav about-page__nav${navEntering ? " is-entering" : ""}`} aria-label="页面导航">
          <a href="#work" aria-label="项目" onClick={onClose}>{reveal(<SlashHoverLabel label="项目" />)}</a>
          <a href="#photography" aria-label="摄影" onClick={onOpenPhotography}>{reveal(<SlashHoverLabel label="摄影" />)}</a>
          <a className="is-current" href="#about-me" aria-label="关于" aria-current="page" onClick={(event) => event.preventDefault()}>{reveal(<SlashHoverLabel label="关于" />, "", true)}</a>
        </nav>
      </header>

      <div className="about-page__content about-blank" aria-label="关于页面">
        <p className="about-blank__descriptor">{reveal("体验思考  /  AI探索  /  视觉探索")}</p>
        <div className="about-blank__name" aria-label="KUN HONG"><span>{reveal("KUN")}</span><span>{reveal("HONG")}</span></div>
        <div className="about-blank__contact" aria-label="联系方式">
          <div className="about-blank__contact-item">
            <span className="about-blank__contact-label">{reveal("微信")}</span>
            <span className="about-blank__contact-value">{reveal("zhi_9650")}</span>
          </div>
          <div className="about-blank__contact-item">
            <span className="about-blank__contact-label">{reveal("邮箱")}</span>
            <span className="about-blank__contact-value">{reveal("357512393@qq.com")}</span>
          </div>
        </div>
        <aside className="about-blank__experience" aria-label="About">
          <h2>{reveal("About")}</h2>
          <div className="about-blank__experience-list">
            <article className="about-blank__experience-item">
              <div className="about-blank__experience-head">
                <div className="about-blank__experience-main">
                  <span className="about-blank__experience-role">{reveal("创客匠人（厦门）科技有限公司")}</span>
                  <span className="about-blank__experience-company">{reveal("UI设计师")}</span>
                </div>
                <span className="about-blank__experience-period">{reveal("2021.05 - 2026.07")}</span>
              </div>
              <p className="about-blank__experience-description">{reveal("参与产品设计、优化方向的前期设计分析讨论、需求整理和梳理，设计后台+公众号+小程序+web等UI界面，后续根据市场和用户反馈持续更新迭代")}</p>
            </article>
            <article className="about-blank__experience-item">
              <div className="about-blank__experience-head">
                <div className="about-blank__experience-main">
                  <span className="about-blank__experience-role">{reveal("厦门三倍空间科技有限公司")}</span>
                  <span className="about-blank__experience-company">{reveal("UI设计师")}</span>
                </div>
                <span className="about-blank__experience-period">{reveal("2019.01 - 2021.04")}</span>
              </div>
              <p className="about-blank__experience-description">{reveal("根据产品需求提供全新的设计方案。基于用户群体差异化进行版本迭代，优化提问操作体验路径，输出设计规范文档，整理组件库，实现设计系统化。")}</p>
            </article>
          </div>
        </aside>
      </div>
    </section>
  );
}
