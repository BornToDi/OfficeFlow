$ErrorActionPreference = "Stop"
$template = Join-Path $PSScriptRoot "OfficeFlow_User_Guide_Bangla.docx"
$output = Join-Path $PSScriptRoot "OfficeFlow_User_Guide_English.docx"
$stage = Join-Path $env:TEMP ("officeflow-en-" + [guid]::NewGuid().ToString("N"))

if (!(Test-Path -LiteralPath $template)) { throw "Bangla guide template not found." }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::ExtractToDirectory($template, $stage)

function X([string]$s) { [Security.SecurityElement]::Escape($s) }
function MakeRun([string]$s, [switch]$b, [string]$c="1F2937", [int]$z=22) {
  $bb=if($b){"<w:b/>"}else{""}; "<w:r><w:rPr><w:rFonts w:ascii=`"Aptos`" w:hAnsi=`"Aptos`"/>$bb<w:color w:val=`"$c`"/><w:sz w:val=`"$z`"/></w:rPr><w:t xml:space=`"preserve`">$(X $s)</w:t></w:r>"
}
function P([string]$s,[string]$style="Normal",[string]$c="1F2937",[int]$z=22,[switch]$b,[string]$align="left",[int]$before=0,[int]$after=120){
  "<w:p><w:pPr><w:pStyle w:val=`"$style`"/><w:jc w:val=`"$align`"/><w:spacing w:before=`"$before`" w:after=`"$after`"/></w:pPr>$(MakeRun $s -b:$b -c $c -z $z)</w:p>"
}
function B([string]$s){ "<w:p><w:pPr><w:numPr><w:ilvl w:val=`"0`"/><w:numId w:val=`"1`"/></w:numPr><w:ind w:left=`"540`" w:hanging=`"260`"/><w:spacing w:after=`"80`"/></w:pPr>$(MakeRun $s -z 21)</w:p>" }
function S([int]$n,[string]$s){ "<w:p><w:pPr><w:ind w:left=`"260`"/><w:spacing w:after=`"110`"/></w:pPr>$(MakeRun "Step ${n}: " -b -c "4F46E5")$(MakeRun $s)</w:p>" }
function N([string]$s,[string]$label="Remember"){ "<w:p><w:pPr><w:shd w:fill=`"FEF3C7`"/><w:ind w:left=`"220`" w:right=`"220`"/><w:spacing w:before=`"100`" w:after=`"140`"/></w:pPr>$(MakeRun "${label} — " -b -c "92400E" -z 21)$(MakeRun $s -c "78350F" -z 21)</w:p>" }
function PB(){ "<w:p><w:r><w:br w:type=`"page`"/></w:r></w:p>" }
function T([object[]]$rows,[int[]]$widths){
  $x="<w:tbl><w:tblPr><w:tblStyle w:val=`"TableGrid`"/><w:tblW w:w=`"0`" w:type=`"auto`"/></w:tblPr><w:tblGrid>"; foreach($w in $widths){$x+="<w:gridCol w:w=`"$w`"/>"};$x+="</w:tblGrid>"
  for($i=0;$i-lt$rows.Count;$i++){ $x+="<w:tr>";for($j=0;$j-lt$rows[$i].Count;$j++){ $fill=if($i-eq 0){"E0E7FF"}elseif($i%2-eq 0){"F8FAFC"}else{"FFFFFF"};$color=if($i-eq 0){"312E81"}else{"1F2937"};$x+="<w:tc><w:tcPr><w:tcW w:w=`"$($widths[$j])`" w:type=`"dxa`"/><w:shd w:fill=`"$fill`"/><w:tcMar><w:top w:w=`"100`" w:type=`"dxa`"/><w:left w:w=`"100`" w:type=`"dxa`"/><w:bottom w:w=`"100`" w:type=`"dxa`"/><w:right w:w=`"100`" w:type=`"dxa`"/></w:tcMar></w:tcPr><w:p>$(MakeRun $rows[$i][$j] -b:($i-eq 0) -c $color -z 19)</w:p></w:tc>"};$x+="</w:tr>"};$x+"</w:tbl><w:p/>"
}
$b=New-Object Text.StringBuilder; function A([string]$s){[void]$b.Append($s)}

A(P "OfficeFlow" "Title" "312E81" 56 -b -align center -before 900 -after 120)
A(P "Conveyance Bill Management System" "Subtitle" "4F46E5" 30 -align center -after 500)
A(P "Complete User Guide (A–Z)" "Title" "111827" 38 -b -align center -after 300)
A(P "Employee • Supervisor • Accounts • Management • Follow-up" "Subtitle" "475569" 22 -align center -after 650)
A(N "This guide explains every common task in simple language. Button and field names are written exactly as they appear in OfficeFlow." "About this guide")
A(P "Version 1.0  |  July 2026" "Normal" "64748B" 19 -align center -before 600);A(PB)

A(P "Contents" "Heading1" "312E81" 34 -b)
@("1. What OfficeFlow does and user roles","2. Login, logout, and password","3. Dashboard and navigation","4. Creating a new bill","5. Save Draft, Edit, Submit, and Delete","6. Finding bills and understanding status","7. Correcting a rejected bill","8. Supervisor review actions","9. Accounts and Follow-up work","10. Management approval","11. Payment request and receipt confirmation","12. Reports, Excel export, and Team","13. Settings and supervisor changes","14. Complete workflow","15. Troubleshooting and checklists")|%{A(B $_)};A(PB)

A(P "1. What is OfficeFlow?" "Heading1" "312E81" 34 -b)
A(P "OfficeFlow is a role-based system for creating conveyance bills, routing them for approval, tracking payment, and preserving a complete action history.")
A(T @(@("Role","Main responsibility"),@("Employee","Create, save, submit, track, and confirm payment for personal bills"),@("Supervisor","Review team bills; edit eligible submissions; approve, forward, or reject; create own bills"),@("Accounts","Review supervisor-approved bills and initiate payment after final approval"),@("Management","Perform final review and approve or reject bills"),@("Follow-up","Monitor pending bills and history using an Accounts-style dashboard")) @(1900,7100))
A(N "Menus and buttons vary by role and current bill status. A missing action is often intentional access control.")

A(P "2. Login, Logout, and Password" "Heading1" "312E81" 34 -b)
A(P "Signing in" "Heading2" "4338CA" 27 -b);A(S 1 "Open the OfficeFlow login page.");A(S 2 "Enter your official email address.");A(S 3 "Enter your password (minimum four characters).");A(S 4 "Select Sign In. A successful login opens your Dashboard.")
A(P "Signing out" "Heading2" "4338CA" 27 -b);A(P "Open the Profile menu at the top and select Log Out. Always sign out on a shared device.")
A(P "Changing your password" "Heading2" "4338CA" 27 -b);A(S 1 "Open Settings.");A(S 2 "Enter Current Password.");A(S 3 "Enter the same value in New Password and Confirm New Password.");A(S 4 "Select Change Password and wait for the success message.")
A(N "If you forget your password, contact an authorized Management user. They can reset it from Team; change the temporary password after login.")

A(P "3. Dashboard and Navigation" "Heading1" "312E81" 34 -b)
A(T @(@("Menu","Purpose"),@("Dashboard","Summary of pending, approved, rejected, paid, and recent bills"),@("New Bill / +","Create a conveyance bill"),@("Bills","View, search, and filter bills within your access scope"),@("Reports","Review status, amount, funnel, and monthly summaries"),@("Team","Search users; authorized users can delete or reset passwords"),@("Settings","Update profile, department, designation, supervisor, and password")) @(2200,6800))
A(P "Open a bill by selecting its View icon/button. Notification badges show the number of items waiting for action.");A(PB)

A(P "4. Employee: Create a New Bill" "Heading1" "312E81" 34 -b)
A(S 1 "Select New Bill or the plus icon.");A(S 2 "Check Company Name, Company Address, Employee Name, and Designation.");A(S 3 "Choose the required option from Bill Format. The available columns change by format.");A(S 4 "Complete the first row with the date, route/time, purpose, and applicable amounts.");A(S 5 "Use Add Item or Add Row for more expenses. Use the trash/remove icon to remove an incorrect row.");A(S 6 "Check the calculated Total and Amount in Words.");A(S 7 "Select Save Draft if unfinished, or Submit Bill if complete.")
A(P "Field guide" "Heading2" "4338CA" 27 -b)
A(T @(@("Field","What to enter"),@("Date / Date From / Date To","Correct travel or expense date/range"),@("From / To","Starting point and destination"),@("Transport / Vehicle","Bus, CNG, car, or other transport"),@("Purpose / Incident","A short, clear business reason"),@("Local / Trip","Applicable local conveyance or trip amount"),@("Food / Hotel / Others","Enter each applicable expense separately"),@("Advance","Money received in advance; used in net calculation"),@("Remarks","Any useful supporting detail"),@("Amount / Total","Numeric amount; totals are calculated automatically")) @(2800,6200))
A(N "Submission fails when a required field is empty. Follow the red validation message and enter amounts using numbers only.")
A(P "Supervisor's own bill" "Heading2" "4338CA" 27 -b);A(P "A Supervisor may also create a bill. When needed, use Forward to Supervisor (optional) to select an upline supervisor. Otherwise, system hierarchy rules determine automatic approval or the next stage.")

A(P "5. Save Draft, Edit, Submit, and Delete" "Heading1" "312E81" 34 -b)
A(P "Save Draft" "Heading2" "4338CA" 27 -b);A(B "Use Save Draft to keep unfinished work safely for later.");A(B "A draft has DRAFT status and is not sent for approval.");A(B "Open it from Bills or Dashboard and select Edit to continue.")
A(P "Edit" "Heading2" "4338CA" 27 -b);A(S 1 "Open the bill details.");A(S 2 "Select Edit.");A(S 3 "Correct fields, rows, or amounts.");A(S 4 "Select Save Draft to continue later or Submit Bill to begin approval.")
A(P "Submit Bill" "Heading2" "4338CA" 27 -b);A(P "Submit Bill sends the bill to the responsible Supervisor and changes its status to SUBMITTED. Verify the dates, route, purpose, amounts, and total first.")
A(P "Delete" "Heading2" "4338CA" 27 -b);A(P "Delete is available only for a DRAFT bill to its owner or eligible direct Supervisor. Deletion is permanent; submitted bills cannot be deleted.")
A(N "Saving a draft is not submission. Select Submit Bill when the bill is ready for review.")

A(P "6. Find Bills and Understand Status" "Heading1" "312E81" 34 -b)
A(P "On Bills, search by bill ID, employee, company, address, incident, or purpose. Use Status to narrow the list and, when available, Employee to view one person's bills.")
A(T @(@("Status","Meaning / next owner"),@("DRAFT","Incomplete; owner must edit or submit"),@("SUBMITTED","Waiting for Supervisor review"),@("APPROVED_BY_SUPERVISOR","Waiting for Accounts"),@("APPROVED_BY_ACCOUNTS","Waiting for Management"),@("APPROVED_BY_MANAGEMENT","Waiting for payment request/receipt confirmation"),@("REJECTED_BY_SUPERVISOR","Returned with a Supervisor reason"),@("REJECTED_BY_ACCOUNTS","Returned with an Accounts reason"),@("REJECTED_BY_MANAGEMENT","Returned with a Management reason"),@("PAID","Claimant confirmed receipt; workflow complete")) @(3300,5700))
A(P "The History section shows each status, comment, timestamp, and actor. Check History first when investigating a problem.")

A(P "7. Correct and Resubmit a Rejected Bill" "Heading1" "312E81" 34 -b)
A(S 1 "Open the rejected bill.");A(S 2 "Read the rejection reason in History.");A(S 3 "Select Edit and correct the relevant date, purpose, route, or amount.");A(S 4 "Select Submit Bill to return it to the approval workflow.")
A(N "Save Draft alone does not return the bill to a reviewer. Submit it after correction.");A(PB)

A(P "8. Supervisor Tasks" "Heading1" "312E81" 34 -b)
A(P "Open a bill from Pending Approvals or Recent Team Bills. Verify employee name/code, dates, route, purpose, amounts, total, remarks, and available supporting information.")
A(P "Approve" "Heading2" "4338CA" 27 -b);A(B "Keep Forward to set to Default — send to Accounts, then select Approve.");A(B "The responsible Supervisor may edit an eligible submitted bill before approval.")
A(P "Forward" "Heading2" "4338CA" 27 -b);A(B "Select another Supervisor in Forward to, then select Approve.");A(B "The bill remains in the Supervisor stage and goes to the selected reviewer—not Accounts.")
A(P "Reject" "Heading2" "4338CA" 27 -b);A(S 1 "Enter a precise Reason, such as 'Incorrect date' or 'Please verify amount'.");A(S 2 "Select Reject. The employee can read the reason in History.")
A(N "A reason is required. Explain exactly what must be corrected.")

A(P "9. Accounts and Follow-up Tasks" "Heading1" "312E81" 34 -b)
A(P "Pending Approval contains Supervisor-approved bills. Pending Payment contains Management-approved bills.")
A(S 1 "Open a Pending Approval bill and verify its details, total, and history.");A(S 2 "If correct, select Approve (send to Management).");A(S 3 "If incorrect, enter a Reason and select Reject.")
A(P "A Follow-up user monitors pending states and history using an Accounts-style dashboard. Available actions still depend on permission and current status.")

A(P "10. Management Tasks" "Heading1" "312E81" 34 -b)
A(S 1 "Open a bill in Pending Approval with APPROVED_BY_ACCOUNTS status.");A(S 2 "Review the details and prior approval history.");A(S 3 "Select Approve (send to Accounts for payment) if correct.");A(S 4 "Otherwise, enter a specific Reason and select Reject.")
A(P "After approval, status becomes APPROVED_BY_MANAGEMENT and Accounts can begin the payment-confirmation process.")

A(P "11. Payment Request and Receipt Confirmation" "Heading1" "312E81" 34 -b)
A(P "Accounts" "Heading2" "4338CA" 27 -b);A(S 1 "Open the Management-approved bill from Pending Payment.");A(S 2 "When payment is completed or ready, select Send Request.");A(S 3 "The button changes to Request Sent! and waits for claimant confirmation.")
A(P "Employee or Supervisor claimant" "Heading2" "4338CA" 27 -b);A(S 1 "Open the bill after the payment request arrives.");A(S 2 "Only after receiving the money, select I received the money.");A(S 3 "Confirm the dialog. The bill changes to PAID.")
A(N "Never confirm receipt before the money actually reaches you. This action completes the bill.")

A(P "12. Reports, Excel Export, and Team" "Heading1" "312E81" 34 -b)
A(P "Reports displays totals, paid and rejected counts, status summaries, approval funnel, and monthly trends within the user's role scope.")
A(P "Excel export" "Heading2" "4338CA" 27 -b);A(S 1 "Select the required dashboard tab or filters.");A(S 2 "Select Export to Excel. The current list downloads as an .xlsx file.")
A(P "Team" "Heading2" "4338CA" 27 -b);A(B "Use name search, role filter, and department filter.");A(B "Authorized Management users may see Delete and Reset Password.");A(B "Delete is permanent. After a reset, instruct the user to change the temporary password.");A(PB)

A(P "13. Settings, Profile, and Supervisor" "Heading1" "312E81" 34 -b)
A(S 1 "Open Settings.");A(S 2 "Update Full Name, Email Address, Designation, and Department.");A(S 3 "Employees should select the correct Supervisor.");A(S 4 "Select Save Changes and wait for confirmation.")
A(P "Changing Supervisor may create an approval request. Settings shows Pending, Approved, or Rejected. Management can review pending supervisor-change requests.")
A(N "An incorrect Supervisor can route a bill to the wrong approver. Verify this setting before submission.")

A(P "14. Complete Workflow at a Glance" "Heading1" "312E81" 34 -b)
A(T @(@("No.","Role","Action","Result"),@("1","Employee","Save Draft","DRAFT"),@("2","Employee","Submit Bill","SUBMITTED"),@("3","Supervisor","Approve (Default)","APPROVED_BY_SUPERVISOR"),@("4","Accounts","Approve","APPROVED_BY_ACCOUNTS"),@("5","Management","Approve","APPROVED_BY_MANAGEMENT"),@("6","Accounts","Send Request","Confirmation pending"),@("7","Employee","I received the money","PAID")) @(800,1900,3200,3000))
A(P "A rejection at any review stage returns the bill with a REJECTED_BY_... status. The claimant corrects it and selects Submit Bill again.")

A(P "15. Troubleshooting" "Heading1" "312E81" 34 -b)
A(T @(@("Problem","Solution"),@("Bill will not submit","Follow red validation messages; complete required fields; use numeric amounts"),@("Supervisor cannot see bill","Check Settings supervisor and confirm the bill is SUBMITTED, not DRAFT"),@("Edit is missing","Editing is limited to eligible Draft/Rejected bills or the responsible Supervisor's eligible submission"),@("Delete is missing","Delete is available only on Draft bills"),@("Approve/Reject is missing","Role, assigned reviewer, or current status does not permit the action"),@("Receipt button is missing","Management approval and Accounts Send Request must happen first"),@("Search shows nothing","Clear search, select All statuses, and check role scope"),@("Cannot log in","Check email/password; ask an authorized user for a reset"),@("Total is wrong","Check each amount and advance; remove extra rows")) @(3000,6000))
A(P "Employee checklist" "Heading2" "4338CA" 27 -b);@("Correct Supervisor selected","Dates and route are correct","Purpose is clear","Amounts and total match","No unnecessary rows","Submit Bill selected—not only Save Draft","Rejection reason addressed","Receipt confirmed only after payment")|%{A(B("☐ "+$_))}
A(P "Approver checklist" "Heading2" "4338CA" 27 -b);@("Employee and period verified","Route and purpose are business-related","Amounts and total checked","History reviewed","Specific rejection reason provided","Correct Supervisor selected when forwarding","Payment request sent only when appropriate")|%{A(B("☐ "+$_))}
A(P "Information to provide when requesting help" "Heading2" "4338CA" 27 -b);A(P "Provide the Bill ID, your email/role, current status, action attempted, and the exact error message or screenshot. Never share your password.")
A(N "This manual reflects the current OfficeFlow workflow and labels. Update it when screens or rules change." "Final note")

$xml="<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><w:document xmlns:w=`"http://schemas.openxmlformats.org/wordprocessingml/2006/main`" xmlns:r=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships`"><w:body>$($b.ToString())<w:sectPr><w:pgSz w:w=`"11906`" w:h=`"16838`"/><w:pgMar w:top=`"900`" w:right=`"900`" w:bottom=`"900`" w:left=`"900`"/></w:sectPr></w:body></w:document>"
$utf8=New-Object Text.UTF8Encoding($false);[IO.File]::WriteAllText((Join-Path $stage "word\document.xml"),$xml,$utf8)
if(Test-Path -LiteralPath $output){Remove-Item -LiteralPath $output};[IO.Compression.ZipFile]::CreateFromDirectory($stage,$output);Remove-Item -LiteralPath $stage -Recurse -Force
Write-Output $output
