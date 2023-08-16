import { subDomains } from '../server/functions/constant';

export const getLogoBySlug = (slug, pageInfoData) => {
  let subDomain = subDomains.find(item => item?.slug === slug);
  let logo = '';
  if (!subDomain) {
    if (pageInfoData.themeMode == 'dark') {
      logo =
        pageInfoData['imageSuffix'] +
        this.props.pageInfoData.appSettings['darktheme_logo'];
    } else {
      logo =
        pageInfoData['imageSuffix'] +
        pageInfoData.appSettings['lightheme_logo'];
    }
  } else {
    if (pageInfoData.themeMode == 'dark') {
      logo =
        pageInfoData['imageSuffix'] + subDomain?.dark_logo ||
        subDomain?.light_logo;
    } else {
      logo = pageInfoData['imageSuffix'] + subDomain?.light_logo;
    }
  }

  return logo;
};
