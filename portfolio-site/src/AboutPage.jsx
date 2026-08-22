import { useEffect } from "react";
import SlashHoverLabel from "./SlashHoverLabel";

export default function AboutPage({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <section className="about-page" aria-label="关于">
      <header className="about-page__header">
        <nav className="site-nav about-page__nav" aria-label="页面导航">
          <a href="#work" aria-label="项目" onClick={onClose}><SlashHoverLabel label="项目" /></a>
          <a href="#photography" aria-label="摄影" onClick={onClose}><SlashHoverLabel label="摄影" /></a>
          <a className="is-current" href="#about-me" aria-label="关于" aria-current="page" onClick={(event) => event.preventDefault()}><SlashHoverLabel label="关于" /></a>
        </nav>
      </header>

      <div className="about-page__content about-blank" aria-label="关于页面">
        <p className="about-blank__descriptor">体验思考&nbsp;&nbsp;/&nbsp;&nbsp;AI探索&nbsp;&nbsp;/&nbsp;&nbsp;视觉探索</p>
        <div className="about-blank__name" aria-label="KUN HONG"><span>KUN</span><span>HONG</span></div>
        <div className="about-blank__contact" aria-label="联系方式">
          <div className="about-blank__contact-item">
            <span className="about-blank__contact-label">微信</span>
            <span className="about-blank__contact-value">zhi_9650</span>
          </div>
          <div className="about-blank__contact-item">
            <span className="about-blank__contact-label">邮箱</span>
            <span className="about-blank__contact-value">357512393@qq.com</span>
          </div>
        </div>
        <aside className="about-blank__experience" aria-label="About">
          <h2>About</h2>
          <div className="about-blank__experience-list">
            <article className="about-blank__experience-item">
              <div className="about-blank__experience-head">
                <div className="about-blank__experience-main">
                  <span className="about-blank__experience-role">创客匠人（厦门）科技有限公司</span>
                  <span className="about-blank__experience-company">UI设计师</span>
                </div>
                <span className="about-blank__experience-period">2021.05 - 2026.07</span>
              </div>
              <p className="about-blank__experience-description">参与产品设计、优化方向的前期设计分析讨论、需求整理和梳理，设计后台+公众号+小程序+web等UI界面，后续根据市场和用户反馈持续更新迭代</p>
            </article>
            <article className="about-blank__experience-item">
              <div className="about-blank__experience-head">
                <div className="about-blank__experience-main">
                  <span className="about-blank__experience-role">厦门三倍空间科技有限公司</span>
                  <span className="about-blank__experience-company">UI设计师</span>
                </div>
                <span className="about-blank__experience-period">2019.01 - 2021.04</span>
              </div>
              <p className="about-blank__experience-description">根据产品需求提供全新的设计方案。基于用户群体差异化进行版本迭代，优化提问操作体验路径，输出设计规范文档，整理组件库，实现设计系统化。</p>
            </article>
          </div>
        </aside>
      </div>
    </section>
  );
}
