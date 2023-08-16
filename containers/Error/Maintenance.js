import React from 'react';
import { getLogoBySlug } from '../../utils/helpers';
const Maintenance = props => {
  let logo = getLogoBySlug(
    this.props.subDomainCategory?.slug,
    this.props.pageInfoData,
  );

  let background = props.pageData.pageInfo.banner;

  return (
    <div
      className="content-wrap maintenancepage"
      style={{
        background: `url(${background})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="overlay"></div>
      <div className="container">
        <div className="row">
          <div className="col-md-12 maintenancepageTxt">
            <div className="logo">
              <img src={logo} />
            </div>
            <h2>{props.t('MAINTENANCE PAGE')}</h2>
            <div className="msg">
              <p>
                {props.t(
                  'We are very sorry for this inconvenience. We are currently working on something new and we will be back soon with awesome new features. Thanks for your patience.',
                )}
              </p>
            </div>
            <div className="access_code">
              <form method="POST">
                <div className="meintenaceForm">
                  <input
                    className="meintenaceFormInput"
                    type="text"
                    name="maintenance_code"
                  />
                  <input
                    className="meintenaceFormBtn"
                    type="submit"
                    value={props.t('Login')}
                  />
                </div>
              </form>
            </div>
            <div className="meintenaceSocial">
              <ul className="footerLinks">
                {props.pageData.socialShareMenus &&
                props.pageData.socialShareMenus.length
                  ? props.pageData.socialShareMenus.map(menu => {
                      return (
                        <li key={menu.menu_id}>
                          <a
                            href={
                              menu.url != 'javascript:void(0)' &&
                              menu.url != 'javascript:'
                                ? menu.url
                                : '#'
                            }
                            target="_blank"
                          >
                            <i className={menu.icon}></i>
                          </a>
                        </li>
                      );
                    })
                  : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
