import React from 'react';
import Menu from '../Menu/Index';
import FixedMenu from '../Menu/Fixed';
import Link from '../../components/Link';
import { getLogoBySlug } from '../../utils/helpers';

class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let logo = '';

    if (typeof window !== 'undefined') {
      const host = window?.location?.hostname;
      const sudDomainSlug = host.toLocaleLowerCase().split('.')?.[0];
      logo = getLogoBySlug(sudDomainSlug, this.props.pageInfoData);
    }

    return this.props.liveStreaming ? (
      <div className="ls_HeaderWrap">
        <div className="container-fluid">
          <div className="ls_headerContent">
            {logo && (
              <div className="logo">
                <Link href="/">
                  <a>
                    <img src={logo} />
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : this.props.layout != 'mobile' ? (
      this.props.pageInfoData.appSettings['fixed_header'] == 1 ? (
        <FixedMenu {...this.props} />
      ) : (
        <Menu {...this.props} />
      )
    ) : (
      <Menu {...this.props} mobileMenu={true} />
    );
  }
}
export default Index;
