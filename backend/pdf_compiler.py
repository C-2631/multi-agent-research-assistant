"""
IEEE Academic Double-Column PDF compiler module.
Uses ReportLab to generate publication-ready academic papers.
"""

import io
import re
from typing import Optional

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Frame, PageTemplate, FrameBreak, NextPageTemplate
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


def clean_markdown_formatting(text: str) -> str:
    """Helper to convert basic markdown tags into ReportLab paragraph XML tags."""
    # Convert bold **text** to <b>text</b>
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    # Convert italics *text* to <i>text</i>
    text = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', text)
    # Remove markdown headers markup
    text = re.sub(r'#+\s+([^\n]+)', r'<b>\1</b>', text)
    # Clean lists markup
    text = re.sub(r'^\s*[-*+]\s+([^\n]+)', r'• \1', text, flags=re.MULTILINE)
    # Remove code blocks ticks
    text = text.replace("```", "")
    return text


def build_double_column_pdf(report_text: str, title: str) -> Optional[bytes]:
    """Compile raw markdown report into an IEEE double-column PDF layout."""
    if not HAS_REPORTLAB:
        return None

    buffer = io.BytesIO()
    
    # 0.5 inch margins are standard for IEEE format
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        leftMargin=0.5*inch, 
        rightMargin=0.5*inch, 
        topMargin=0.75*inch, 
        bottomMargin=0.75*inch
    )

    # Margins & columns frame settings
    margin = 0.5 * inch
    width = doc.width  # 7.5 inches total printable area
    height = doc.height # 9.5 inches total printable height
    
    col_width = 3.6 * inch
    col_gap = 0.3 * inch

    # Left and Right column frames
    frame_left = Frame(margin, margin, col_width, height, id='col1', topPadding=0, bottomPadding=0)
    frame_right = Frame(margin + col_width + col_gap, margin, col_width, height, id='col2', topPadding=0, bottomPadding=0)
    
    # Add a page template
    two_col_template = PageTemplate(id='TwoCol', frames=[frame_left, frame_right])
    doc.addPageTemplates([two_col_template])

    # IEEE Styles setup
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        name='IEEETitle',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=16,
        leading=20,
        alignment=TA_CENTER,
        textColor=HexColor('#000000'),
        spaceAfter=15
    )

    heading_style = ParagraphStyle(
        name='IEEEHeading',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=12,
        leading=14,
        alignment=TA_LEFT,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        name='IEEEBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=10,
        leading=13,
        alignment=TA_JUSTIFY,
        spaceAfter=8
    )

    story = []

    # Title segment (spans across both columns as header)
    clean_title = clean_markdown_formatting(title)
    story.append(Paragraph(clean_title, title_style))
    story.append(Spacer(1, 10))

    # Split body into sections and compile paragraphs
    lines = report_text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('#'):
            clean_hdr = clean_markdown_formatting(line)
            story.append(Paragraph(clean_hdr, heading_style))
        else:
            clean_body = clean_markdown_formatting(line)
            story.append(Paragraph(clean_body, body_style))

    # Build the document
    doc.build(story)
    
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
