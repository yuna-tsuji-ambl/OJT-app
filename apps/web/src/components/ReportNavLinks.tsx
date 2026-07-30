import { Link } from 'react-router-dom';
import {
  REPORT_NAV_ARIA_LABEL,
  type ReportNavLinkItem,
} from '../domain/reportForm';

interface ReportNavLinksProps {
  links: readonly ReportNavLinkItem[];
}

/** 報告書画面への共通導線ナビ */
export function ReportNavLinks({ links }: ReportNavLinksProps) {
  return (
    <nav aria-label={REPORT_NAV_ARIA_LABEL}>
      {links.map((link) => (
        <Link key={link.to} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
