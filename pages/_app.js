import React from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';
import * as actions from '../store/actions/general';
import { I18nextProvider } from 'react-i18next';
import { registerI18n, i18n } from '../i18n';
import App from 'next/app';
import { wrapper } from '../store/index';
import NProgress from 'nprogress';
import config from '../config';
import socketOpen from 'socket.io-client';
import MiniPlayer from '../containers/Video/MiniPlayer';
import AudioPlayer from '../containers/Audio/Player';
import Head from 'next/head';
import axios from 'axios';
import { languages, subDomains } from '../server/functions/constant';

const socket = socketOpen(config.app_server);
registerI18n(Router);
/* debug to log how the store is being used */

class MyApp extends App {
  constructor(props) {
    super(props);
    this.state = {
      languageLoading: false,
      ip_language: 'hindi',
      subDomainCategory: null,
    };
  }
  static async getInitialProps({ Component, ctx }) {
    // Recompile pre-existing pageProps

    let pageProps = {};
    if (Component.getInitialProps)
      pageProps = await Component.getInitialProps(ctx);

    // Initiate vars to return
    const { req } = ctx;
    let initialI18nStore = {};
    let initialLanguage = null;
    let currentPageUrl = null;
    // Load translations to serialize if we're serverside
    if (req) {
      currentPageUrl = req.originalUrl;
    }
    if (req && req.i18n) {
      [initialLanguage] = req.i18n.languages;
      i18n.language = initialLanguage;
      initialI18nStore = req.i18n.store.data;
    } else {
      // Load newly-required translations if changing route clientside
      await Promise.all(
        i18n.nsFromReactTree
          .filter(ns => !i18n.hasResourceBundle(i18n.languages[0], ns))
          .map(
            ns =>
              new Promise(resolve => i18n.loadNamespaces(ns, () => resolve())),
          ),
      );
      initialI18nStore = i18n.store.data;
      initialLanguage = i18n.language;
    }

    let userAgent;
    if (req) {
      // if you are on the server and you get a 'req' property from your context
      userAgent = req.headers['user-agent']; // get the user-agent from the headers
    } else {
      userAgent = navigator.userAgent; // if you are on the client you can access the navigator from the window object
    }

    let isMobile = false;
    if (userAgent) {
      isMobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
        ),
      );
    }
    // `pageProps` will get serialized automatically by NextJs
    return {
      pageProps: {
        ...pageProps,
        isMobile: isMobile,
        initialI18nStore,
        initialLanguage,
        currentPageUrl: currentPageUrl,
      },
    };
  }
  onRouteChangeStart = url => {
    NProgress.start();
  };
  onRouteChangeComplete = url => {
    NProgress.done();
  };
  onRouteChangeError = (err, url) => {
    NProgress.done();
  };

  onRegisterPushNotification = () => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorker = async () => {
        const register = await navigator.serviceWorker.register(
          '/notification_sw.js',
        );

        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.VAPID_PUBLIC_KEY,
        });

        const res = await fetch('/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'content-type': 'application/json',
          },
        });

        const data = await res.json();
        console.log(data);
      };
      handleServiceWorker();
    }
  };

  getmyIp = () => {
    if (!localStorage.getItem('ip_language')) {
      // this.setState({ languageLoading: true });
    } else {
      this.setState({
        ip_language: localStorage.getItem('ip_language'),
      });
    }
    axios.get('https://api.ipify.org/?format=json').then(response => {
      const data = response?.data;
      axios.get(`/api/get-my-ip-info/${data?.ip}`).then(response => {
        const data = response?.data;
        this.setState({ isLanguageSet: true });
        const language = languages.find(item => {
          if (item?.region?.findIndex(e => e === data?.regionName) !== -1) {
            return true;
          }
          return false;
        })?.value;
        if (language) {
          localStorage.setItem('ip_language', language);

          this.setState({
            languageLoading: false,
            ip_language: language,
          });
        } else {
          localStorage.setItem('ip_language', 'hindi');

          this.setState({
            languageLoading: false,
            ip_language: 'hindi',
          });
        }
      });
    });
  };

  handleSubdomain = () => {
    const host = window?.location?.hostname;
    // const host = 'sbi.inqtube.com';
    const sudDomainSlug = host.toLocaleLowerCase().split('.')?.[0];
    if (sudDomainSlug) {
      axios.get(`/api/category-by-slug/${sudDomainSlug}`).then(response => {
        const data = response?.data;
        if (data?.result) {
          this.setState({ subDomainCategory: data?.result });
        }
      });
    }
  };
  componentDidMount() {
    this.onRegisterPushNotification();
    this.handleSubdomain();
    this.getmyIp();
    Router.events.on('routeChangeStart', this.onRouteChangeStart);
    Router.events.on('routeChangeComplete', this.onRouteChangeComplete);
    Router.events.on('routeChangeError', this.onRouteChangeError);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    nextProps.setPageInfoData(nextProps.pageProps.pageData);
    return null;
  }

  render() {
    const { Component, pageProps } = this.props;
    let { initialLanguage, initialI18nStore, isMobile } = pageProps;
    i18n.store.data = initialI18nStore;

    if (!i18n.language) {
      i18n.language = initialLanguage;
      i18n.translator.changeLanguage(initialLanguage);
    }

    if (typeof window !== 'undefined') {
      const activeLanguage = localStorage.getItem('active_language');
      i18n.translator.changeLanguage(activeLanguage);
    }
    return (
      <React.Fragment>
        <I18nextProvider
          i18n={i18n}
          initialLanguage={initialLanguage}
          initialI18nStore={initialI18nStore}
        >
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
            ></meta>
          </Head>
          {/* {this.state.isLanguageSet ? ( */}
          <>
            <Component
              {...pageProps}
              isMobile={isMobile ? 992 : 993}
              socket={socket}
              ip_language={this.state.ip_language}
              subDomainCategory={this.state.subDomainCategory}
            />
            <MiniPlayer
              {...pageProps}
              isMobile={isMobile ? 992 : 993}
              socket={socket}
              ip_language={this.state.ip_language}
              subDomainCategory={this.state.subDomainCategory}
            />
            <AudioPlayer
              {...pageProps}
              isMobile={isMobile ? 992 : 993}
              socket={socket}
              ip_language={this.state.ip_language}
              subDomainCategory={this.state.subDomainCategory}
            />
          </>
          {/* ) : ( */}
          {this.state.languageLoading && (
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                width: '100%',
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 99999999,
              }}
            >
              <h1 style={{ color: 'white' }}>Initializing language...</h1>
            </div>
          )}
          {/* )} */}
        </I18nextProvider>
      </React.Fragment>
    );
  }
}
const mapDispatchToProps = dispatch => {
  return {
    setPageInfoData: data => dispatch(actions.setPageInfoData(data)),
    menuOpen: status => dispatch(actions.menuOpen(status)),
  };
};
export default wrapper.withRedux(connect(null, mapDispatchToProps)(MyApp));
