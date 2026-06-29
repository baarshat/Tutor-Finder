describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('input#email').type('superadmin@tutorfinder.com')
    cy.get('input#password').type('SuperAdmin@123')
    cy.get('button[type="submit"]').click()
  })
})