import React, {useState, useEffect} from 'react';
import SideBar from './Dashboard/SideBar';
import Content from './Dashboard/Content';
import TopBar from './Dashboard/TopBar';
import 'bootstrap/dist/css/bootstrap.css';
import './_app.css'
import Head from 'next/head';
import Image from "next/image";
import { getOrganisation, getProject, validateAccessToken } from "@/pages/api/DashboardService";
import { githubClientId } from "@/pages/api/apiConfig";
import { useRouter } from 'next/router';
import querystring from 'querystring';
import {refreshUrl} from "@/utils/utils";

export default function App() {
  const [selectedView, setSelectedView] = useState('');
  const [tokenAuthenticated, isTokenAuthenticated] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userName, setUserName] = useState('');
  const [organisationId, setOrganisationId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const queryParams = router.asPath.split('?')[1];
    const parsedParams = querystring.parse(queryParams);
    let access_token = parsedParams.access_token || null;

    if(typeof window !== 'undefined' && access_token) {
      localStorage.setItem('accessToken', access_token);
      refreshUrl();
    }

    validateAccessToken()
      .then((response) => {
        setUserName(response.data.name || '');
        isTokenAuthenticated(true);
        getOrganisation(response.data.id)
          .then((response) => {
            setOrganisationId(response.data.id);
          })
          .catch((error) => {
            console.error('Error fetching project:', error);
          });
      })
      .catch((error) => {
        console.error('Error validating access token:', error);
      });
  }, []);

  useEffect(() => {
    getProject(organisationId)
      .then((response) => {
        setSelectedProject(response.data[0]);
      })
      .catch((error) => {
        console.error('Error fetching project:', error);
      });
  }, [organisationId]);
  
  const handleSelectionEvent = (data) => {
    setSelectedView(data);
  };

  function signInUser() {
    const github_client_id = githubClientId();
    window.open(`https://github.com/login/oauth/authorize?scope=user:email&client_id=${github_client_id}`, '_self')
  }

  return (
    <div className="app">
      <Head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      </Head>
      {tokenAuthenticated ? <div className="projectStyle">
        <div className="sideBarStyle">
          <SideBar onSelectEvent={handleSelectionEvent}/>
        </div>
        <div className="workSpaceStyle">
          <div className="topBarStyle">
            <TopBar selectedProject={selectedProject} userName={userName}/>
          </div>
          <div className="contentStyle">
            <Content selectedView={selectedView} selectedProjectId={selectedProject?.id || ''}/>
          </div>
        </div>
      </div> : <div className="signInStyle">
        <div className="signInTopBar">
          <div className="superAgiLogo"><Image width={132} height={72} src="/images/sign-in-logo.svg" alt="super-agi-logo"/></div>
        </div>
        <div className="signInCenter">
          <div className="signInWrapper">
            <button className="signInButton" onClick={signInUser}>
              <Image width={20} height={20} src="/images/github.svg" alt="github"/>&nbsp;Continue with Github
            </button>
            <div className="signInInfo">
              By continuing, you agree to Super AGI’s Terms of Service and Privacy Policy, and to receive important updates.
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
