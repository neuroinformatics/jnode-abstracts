import React from 'react';

import { faHouse, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const HeaderPanel: React.FC = () => {
  return (
    <Navbar expand="md" className="header navbar-dark bg-primary border border-primary rounded">
      <Container fluid>
        <Navbar.Brand className="p-3" href="/">
          <FontAwesomeIcon icon={faHouse} className="pe-2" />
          Conference abstracts and submission
        </Navbar.Brand>
        <Navbar.Toggle className="me-3" aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="basic-navbar-nav">
          <Nav className="me-auto">
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
            <Nav.Item>
              <LinkContainer to="/active">
                <Nav.Link>Active?</Nav.Link>
              </LinkContainer>
            </Nav.Item>
          </Nav>
          <Nav className="d-flex">
            <NavDropdown title="User Name" id="basic-nav-dropdown">
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
            <Nav.Item>
              <LinkContainer to="/login">
                <Nav.Link>Login</Nav.Link>
              </LinkContainer>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
      <Container fluid>
        <Navbar.Collapse className="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <LinkContainer to="/conference/AINI2018">
                <Nav.Link>Short Name</Nav.Link>
              </LinkContainer>
            </Nav.Item>
            <Nav.Item>
              <LinkContainer to="/conference/AINI2018/schedule">
                <Nav.Link>Schedule</Nav.Link>
              </LinkContainer>
            </Nav.Item>
            <Nav.Item>
              <LinkContainer to="/conference/AINI2018/abstracts">
                <Nav.Link>Abstracts</Nav.Link>
              </LinkContainer>
            </Nav.Item>
            <Nav.Item>
              <LinkContainer to="/conference/AINI2018/locations">
                <Nav.Link>Locations</Nav.Link>
              </LinkContainer>
            </Nav.Item>
            <Nav.Item>
              <LinkContainer to="/conference/AINI2018/floodplains">
                <Nav.Link>Floorplans</Nav.Link>
              </LinkContainer>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="https://www.neuroinf.jp/aini2018/">
                <FontAwesomeIcon icon={faUpRightFromSquare} className="pe-2" />
                Conference home
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderPanel;
