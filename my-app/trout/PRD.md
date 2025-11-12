# Product Requirements Document (PRD)
## Estimating Apex - Quality Assurance Checklist Application

### Version: 1.0.1

---

## 1. Overview

### 1.1 Purpose
A custom application to check work quality when submitting proposals, ensuring no issues downstream throughout the estimating process. This tool provides structured quality checks at various stages of the proposal workflow.

### 1.2 Goals
- Ensure quality and consistency in proposal submissions
- Prevent downstream issues through systematic checks
- Create a centralized logging system for quality checks
- Streamline the final review process before proposal submission

---

## 2. Technical Requirements

### 2.1 Technology Stack
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Design System**: Token-based Tailwind design system (post-MVP)
- **Platform**: Desktop-first, mobile-responsive

### 2.2 Technical Constraints
- **Privacy**: Tool should not be indexed by search engines
- **Display**: Must fit entirely on a 1080p screen when loaded
- **Primary Use Case**: Desktop (mobile support should be easily addable)

---

## 3. User Requirements

### 3.1 User Input
Users must be able to input:
- **Client** (from predefined list)
- **Location Number**

### 3.2 User Experience
- Clean, modern interface
- Questions presented with Yes/No (or equivalent) button selections
- All checks visible on single 1080p screen
- Intuitive navigation through checklist steps

---

## 4. Feature Specifications

### 4.1 Core Components & Checklist Items

#### CE – Cost Sheet
- [ ] Does the price make sense?
- [ ] Do we need to include ER or inspection costs? (Walgreens, Target, Dollar General)
- [ ] Is the State filled out and taxes populated in states where it needs to?
- [ ] Sub or Apex Super?
- [ ] Mob/Demob for equipment?
- [ ] Is this a concrete job? If so, is a breaker added?

#### SOW Document
- [ ] Is the date updated?
- [ ] Does everything make sense?
- [ ] Are all brand specific fields filled out?
- [ ] Formatting (Header, Spacing)
- [ ] Update price on SOW document?

#### PA Folder
- [ ] Is the PA folder created with a copy in the main project drive?

#### Notes Section
- Log of all checks performed
- What was checked
- Timestamped and dated (EST timezone)

---

## 5. Client List

Predefined client options:
- Costco
- Home Depot
- Lowes
- Publix
- Dollar General
- ExtraSpace
- Wawa
- Walgreens
- Other

---

## 6. Version Roadmap

### Version 1.0.1 (Current)
- Basic checklist functionality
- Client and location number input
- Final push quality checks (CE, SOW, PA Folder)
- Notes/logging system
- Desktop-optimized UI (1080p screen)

### Version 1.0.2 (Future)
- Password protection to prevent bots
- Earlier process steps:
  - Onboarding
  - SOW Review
  - CE Development
  - Additional workflow stages

---

## 7. Design Principles

### 7.1 Visual Design
- Always maintain clean, professional appearance
- Token-based design system for scalability (post-MVP)
- Consistent spacing and typography
- Clear visual hierarchy

### 7.2 User Interface
- Question-based interface with clear Yes/No selections
- Progress indication
- Easy navigation between checklist sections
- Prominent notes/logging area

---

## 8. Success Metrics

- Reduction in downstream issues from proposals
- Time saved in quality checking process
- Consistency in proposal quality
- Complete audit trail of checks performed

---

## 9. Out of Scope (v1.0.1)

- Password protection
- Earlier workflow steps (onboarding, SOW review, CE development)
- Multi-user collaboration features
- Integration with external systems
- Advanced reporting/analytics

---

## 10. Future Considerations

- Expand to cover entire estimating workflow
- Integration with proposal/document management systems
- Team collaboration features
- Advanced analytics and reporting
- Customizable checklist templates per client
- Mobile app version

