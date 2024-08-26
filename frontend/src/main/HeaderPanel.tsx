import React from 'react';

import { faHouse, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAppSelector } from '../app/hooks';
import { selectConferenceInfo } from '../features/conference/conferenceSlice';
import { selectUserInfo } from '../features/user/userSlice';

const HeaderPanel: React.FC = () => {
  const userInfo = useAppSelector(selectUserInfo);
  const conferenceInfo = useAppSelector(selectConferenceInfo);

  return (
    <Navbar expand="md" className="header navbar-dark bg-primary border border-primary rounded">
      <Container fluid>
        <LinkContainer to="/">
          <Navbar.Brand className="p-3">
            <FontAwesomeIcon icon={faHouse} className="pe-2" />
            Conference abstracts and submission
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle className="me-3" aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="basic-navbar-nav">
          <Nav className="me-auto">
            {userInfo != null ? (
              <>
                <Nav.Item>
                  <LinkContainer to="/myabstracts">
                    <Nav.Link>My Abstracts</Nav.Link>
                  </LinkContainer>
                </Nav.Item>
                <Nav.Item>
                  <LinkContainer to="/favouriteabstracts">
                    <Nav.Link>My Favorites</Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              </>
            ) : null}
            <Nav.Item>
              <LinkContainer to="/active">
                <Nav.Link>Active?</Nav.Link>
              </LinkContainer>
            </Nav.Item>
          </Nav>
          <Nav className="d-flex">
            {userInfo != null ? (
              <NavDropdown title={`${userInfo.firstName} ${userInfo.lastName}`} id="basic-nav-dropdown">
                <LinkContainer to="/myabstracts">
                  <NavDropdown.Item>My Abstracts</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Header>My Settings</NavDropdown.Header>
                <LinkContainer to="/password">
                  <NavDropdown.Item>Change Password</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/mail">
                  <NavDropdown.Item>Change Email</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Header>Site Admin</NavDropdown.Header>
                <LinkContainer to="/dashboard/conference">
                  <NavDropdown.Item>Create Conference</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/dashboard/accounts">
                  <NavDropdown.Item>Accounts</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Header>Conference Admin</NavDropdown.Header>
                <LinkContainer to="/dashboard/conference/74cd39d6-5277-4b1a-a679-819032f7d2c4/abstracts">
                  <NavDropdown.Item>Conference Abstracts</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/dashboard/conference/74cd39d6-5277-4b1a-a679-819032f7d2c4">
                  <NavDropdown.Item>Conference Settings</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <LinkContainer to="/logout">
                  <NavDropdown.Item>Logout</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            ) : (
              <Nav.Item>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      {conferenceInfo != null && (
        <Container fluid>
          <Navbar.Collapse className="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Item>
                <LinkContainer to={`/conferences/${conferenceInfo.shortName}`}>
                  <Nav.Link>{conferenceInfo.shortName}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
              {conferenceInfo.schedule != null && (
                <Nav.Item>
                  <LinkContainer to={`/conferences/${conferenceInfo.shortName}/schedule`}>
                    <Nav.Link>Schedule</Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              )}
              <Nav.Item>
                <LinkContainer to={`/conferences/${conferenceInfo.shortName}/abstracts`}>
                  <Nav.Link>Abstracts</Nav.Link>
                </LinkContainer>
              </Nav.Item>
              {conferenceInfo.geo != null && (
                <>
                  <Nav.Item>
                    <LinkContainer to={`/conferences/${conferenceInfo.shortName}/locations`}>
                      <Nav.Link>Locations</Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={`/conferences/${conferenceInfo.shortName}/floodplains`}>
                      <Nav.Link>Floorplans</Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                </>
              )}
              {conferenceInfo.link != null && (
                <Nav.Item>
                  <Nav.Link href={conferenceInfo.link} target="_blank">
                    <FontAwesomeIcon icon={faUpRightFromSquare} className="pe-2" />
                    Conference home
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      )}
    </Navbar>
  );
};

export default HeaderPanel;
