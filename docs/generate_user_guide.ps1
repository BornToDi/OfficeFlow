$ErrorActionPreference = "Stop"

$outputPath = Join-Path $PSScriptRoot "OfficeFlow_User_Guide_Bangla.docx"
$stagePath = Join-Path $env:TEMP ("officeflow-guide-" + [guid]::NewGuid().ToString("N"))
$relsPath = Join-Path $stagePath "_rels"
$wordPath = Join-Path $stagePath "word"
$wordRelsPath = Join-Path $wordPath "_rels"
New-Item -ItemType Directory -Path $relsPath, $wordPath, $wordRelsPath | Out-Null

function Escape-Xml([string]$Text) {
  return [System.Security.SecurityElement]::Escape($Text)
}

function Run([string]$Text, [switch]$Bold, [switch]$Italic, [string]$Color = "1F2937", [int]$Size = 22) {
  $weight = if ($Bold) { "<w:b/>" } else { "" }
  $italics = if ($Italic) { "<w:i/>" } else { "" }
  $safe = Escape-Xml $Text
  return "<w:r><w:rPr><w:rFonts w:ascii=`"Nirmala UI`" w:hAnsi=`"Nirmala UI`" w:cs=`"Nirmala UI`"/>$weight$italics<w:color w:val=`"$Color`"/><w:sz w:val=`"$Size`"/><w:szCs w:val=`"$Size`"/><w:lang w:val=`"bn-BD`"/></w:rPr><w:t xml:space=`"preserve`">$safe</w:t></w:r>"
}

function Paragraph([string]$Text, [string]$Style = "Normal", [string]$Color = "1F2937", [int]$Size = 22, [switch]$Bold, [switch]$Italic, [string]$Align = "left", [int]$Before = 0, [int]$After = 120) {
  $r = Run $Text -Bold:$Bold -Italic:$Italic -Color $Color -Size $Size
  return "<w:p><w:pPr><w:pStyle w:val=`"$Style`"/><w:jc w:val=`"$Align`"/><w:spacing w:before=`"$Before`" w:after=`"$After`"/></w:pPr>$r</w:p>"
}

function Bullet([string]$Text, [int]$Level = 0) {
  $left = 540 + ($Level * 360)
  $r = Run $Text -Size 21
  return "<w:p><w:pPr><w:numPr><w:ilvl w:val=`"$Level`"/><w:numId w:val=`"1`"/></w:numPr><w:ind w:left=`"$left`" w:hanging=`"260`"/><w:spacing w:after=`"80`"/></w:pPr>$r</w:p>"
}

function Step([int]$Number, [string]$Text) {
  $r1 = Run ("ধাপ " + $Number + ": ") -Bold -Color "4F46E5" -Size 22
  $r2 = Run $Text -Size 22
  return "<w:p><w:pPr><w:ind w:left=`"260`"/><w:spacing w:after=`"110`"/></w:pPr>$r1$r2</w:p>"
}

function Note([string]$Text, [string]$Label = "মনে রাখুন") {
  $r1 = Run ("$Label — ") -Bold -Color "92400E" -Size 21
  $r2 = Run $Text -Color "78350F" -Size 21
  return "<w:p><w:pPr><w:shd w:fill=`"FEF3C7`"/><w:ind w:left=`"220`" w:right=`"220`"/><w:spacing w:before=`"100`" w:after=`"140`"/></w:pPr>$r1$r2</w:p>"
}

function PageBreak() { return "<w:p><w:r><w:br w:type=`"page`"/></w:r></w:p>" }

function Table([string[][]]$Rows, [int[]]$Widths) {
  $xml = "<w:tbl><w:tblPr><w:tblStyle w:val=`"TableGrid`"/><w:tblW w:w=`"0`" w:type=`"auto`"/><w:tblLook w:val=`"04A0`"/></w:tblPr><w:tblGrid>"
  foreach ($w in $Widths) { $xml += "<w:gridCol w:w=`"$w`"/>" }
  $xml += "</w:tblGrid>"
  for ($i = 0; $i -lt $Rows.Count; $i++) {
    $xml += "<w:tr>"
    for ($j = 0; $j -lt $Rows[$i].Count; $j++) {
      $fill = if ($i -eq 0) { "E0E7FF" } elseif ($i % 2 -eq 0) { "F8FAFC" } else { "FFFFFF" }
      $bold = $i -eq 0
      $cellRun = Run $Rows[$i][$j] -Bold:$bold -Color $(if ($i -eq 0) { "312E81" } else { "1F2937" }) -Size 19
      $xml += "<w:tc><w:tcPr><w:tcW w:w=`"$($Widths[$j])`" w:type=`"dxa`"/><w:shd w:fill=`"$fill`"/><w:tcMar><w:top w:w=`"100`" w:type=`"dxa`"/><w:left w:w=`"100`" w:type=`"dxa`"/><w:bottom w:w=`"100`" w:type=`"dxa`"/><w:right w:w=`"100`" w:type=`"dxa`"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:after=`"40`"/></w:pPr>$cellRun</w:p></w:tc>"
    }
    $xml += "</w:tr>"
  }
  return $xml + "</w:tbl><w:p/>"
}

$body = New-Object System.Text.StringBuilder
function Add([string]$Xml) { [void]$body.Append($Xml) }

# Cover
Add (Paragraph "OfficeFlow" "Title" "312E81" 56 -Bold -Align center -Before 900 -After 120)
Add (Paragraph "Conveyance Bill Management System" "Subtitle" "4F46E5" 30 -Align center -After 500)
Add (Paragraph "সম্পূর্ণ ব্যবহার নির্দেশিকা (A–Z)" "Title" "111827" 38 -Bold -Align center -After 300)
Add (Paragraph "Employee • Supervisor • Accounts • Management • Follow-up" "Subtitle" "475569" 22 -Align center -After 650)
Add (Note "এই নির্দেশিকাটি সাধারণ ব্যবহারকারীর জন্য সহজ ভাষায় তৈরি। স্ক্রিনে থাকা ইংরেজি button/field-এর নাম একইভাবে লেখা হয়েছে, যাতে খুঁজে পেতে সুবিধা হয়।" "এই গাইড সম্পর্কে")
Add (Paragraph "সংস্করণ: ১.০  |  প্রস্তুতের তারিখ: জুলাই ২০২৬" "Normal" "64748B" 19 -Align center -Before 600)
Add (PageBreak)

# Contents and overview
Add (Paragraph "সূচিপত্র" "Heading1" "312E81" 34 -Bold)
@(
  "১. OfficeFlow কী এবং কারা ব্যবহার করবেন", "২. Login, Logout ও Password", "৩. Dashboard ও Menu পরিচিতি",
  "৪. Employee: নতুন Bill তৈরি", "৫. Save Draft, Edit, Submit ও Delete", "৬. Bill দেখা, Search/Filter ও Status বোঝা",
  "৭. Rejected Bill ঠিক করে আবার Submit", "৮. Supervisor: Review, Edit, Approve, Forward ও Reject",
  "৯. Accounts ও Follow-up User-এর কাজ", "১০. Management-এর কাজ", "১১. Payment Request ও টাকা পাওয়ার Confirmation",
  "১২. Reports, Excel Export ও Team", "১৩. Settings, Profile ও Supervisor Change", "১৪. সম্পূর্ণ Workflow",
  "১৫. ভুল এড়ানোর উপায়, Troubleshooting ও Quick Checklist"
) | ForEach-Object { Add (Bullet $_) }
Add (PageBreak)

Add (Paragraph "১. OfficeFlow কী?" "Heading1" "312E81" 34 -Bold)
Add (Paragraph "OfficeFlow হলো conveyance bill তৈরি, অনুমোদন, payment tracking এবং history সংরক্ষণের একটি role-based system। প্রত্যেক user নিজের role অনুযায়ী প্রয়োজনীয় page ও action দেখতে পান।")
Add (Table @(
  @("Role", "মূল দায়িত্ব"),
  @("Employee", "নিজের bill তৈরি, draft রাখা, submit করা, status দেখা এবং টাকা পাওয়ার confirmation দেওয়া"),
  @("Supervisor", "Team bill যাচাই, প্রয়োজন হলে edit, approve/forward অথবা reason দিয়ে reject করা; নিজের bill-ও তৈরি করা"),
  @("Accounts", "Supervisor-approved bill যাচাই, Management-এ পাঠানো এবং final approval-এর পরে payment request পাঠানো"),
  @("Management", "Accounts-approved bill final review করে approve অথবা reject করা"),
  @("Follow-up", "Accounts dashboard-এর মতো pending bill follow-up ও history পর্যবেক্ষণ করা")
) @(1900, 7100))
Add (Note "আপনার role অনুযায়ী কিছু menu, dashboard card বা button না-ও দেখা যেতে পারে—এটি স্বাভাবিক।")

Add (Paragraph "২. Login, Logout ও Password" "Heading1" "312E81" 34 -Bold)
Add (Paragraph "Login করার নিয়ম" "Heading2" "4338CA" 27 -Bold)
Add (Step 1 "OfficeFlow-এর login page খুলুন।")
Add (Step 2 "Email field-এ আপনার অফিস email লিখুন।")
Add (Step 3 "Password লিখুন (কমপক্ষে ৪ অক্ষর)।")
Add (Step 4 "Sign In button চাপুন। সফল হলে Dashboard খুলবে।")
Add (Paragraph "Logout" "Heading2" "4338CA" 27 -Bold)
Add (Paragraph "উপরের Profile menu খুলে Log Out চাপুন। অন্যের device ব্যবহার করলে কাজ শেষে অবশ্যই logout করুন।")
Add (Paragraph "Password পরিবর্তন" "Heading2" "4338CA" 27 -Bold)
Add (Step 1 "Sidebar বা Profile menu থেকে Settings খুলুন।")
Add (Step 2 "Change Password অংশে Current Password লিখুন।")
Add (Step 3 "New Password ও Confirm New Password একইভাবে লিখুন।")
Add (Step 4 "Change Password চাপুন। Success message দেখলে নতুন password কার্যকর।")
Add (Note "Password ভুলে গেলে authority/Management user-এর সাহায্য নিন। Team page থেকে authorized user password reset করতে পারেন।")

Add (Paragraph "৩. Dashboard ও Menu পরিচিতি" "Heading1" "312E81" 34 -Bold)
Add (Table @(
  @("Menu", "কাজ"), @("Dashboard", "Pending, Approved, Rejected, Paid এবং সাম্প্রতিক bill-এর summary"),
  @("New Bill / + icon", "নতুন conveyance bill তৈরি"), @("Bills", "সব অনুমোদিত scope-এর bill দেখা, search ও filter"),
  @("Reports", "Status, amount, trend ও summary report"), @("Team", "User list; permission অনুযায়ী delete/reset password"),
  @("Settings", "Profile, department, designation, supervisor এবং password")
) @(2200, 6800))
Add (Paragraph "Bill row-এর ডান পাশে View icon/button চাপলে Bill Details খুলবে। Dashboard-এর notification/badge pending কাজের সংখ্যা বোঝায়।")
Add (PageBreak)

# Employee creation
Add (Paragraph "৪. Employee: নতুন Bill তৈরি" "Heading1" "312E81" 34 -Bold)
Add (Step 1 "Sidebar থেকে New Bill / plus icon চাপুন। Create New Conveyance Bill page খুলবে।")
Add (Step 2 "উপরের তথ্য যাচাই করুন: Company Name, Company Address, Employee Name এবং Designation।")
Add (Step 3 "Bill Format dropdown থেকে প্রয়োজনীয় format নির্বাচন করুন। Format বদলালে row-এর column-ও বদলাবে।")
Add (Step 4 "প্রথম row-তে তারিখ, যাত্রার স্থান/সময়, purpose এবং applicable amount লিখুন।")
Add (Step 5 "আরও খরচ থাকলে Add Item বা Add Row চাপুন। ভুল row সরাতে trash/remove icon চাপুন।")
Add (Step 6 "সব amount যাচাই করুন। Total এবং Amount in Words system নিজে হিসাব করে দেখাবে।")
Add (Step 7 "কাজ অসম্পূর্ণ হলে Save Draft; সম্পূর্ণ হলে Submit Bill চাপুন।")

Add (Paragraph "Bill format ও field-এর সহজ ব্যাখ্যা" "Heading2" "4338CA" 27 -Bold)
Add (Table @(
  @("Field/Column", "কী লিখবেন"),
  @("Date / Date From / Date To", "ভ্রমণ বা খরচের সঠিক তারিখ/সময়সীমা"),
  @("From / To", "যাত্রা শুরুর স্থান ও গন্তব্য"),
  @("Transport / Vehicle", "ব্যবহৃত যানবাহন—যেমন CNG, Bus, Car"),
  @("Purpose / Incident", "কেন যাত্রা/খরচ হয়েছে—সংক্ষিপ্ত কিন্তু পরিষ্কার কারণ"),
  @("Local / Trip", "প্রযোজ্য local conveyance বা trip amount"),
  @("Food / Hotel / Others", "প্রযোজ্য খরচ আলাদা column-এ"),
  @("Advance", "আগে পাওয়া টাকা; net/total থেকে সমন্বয় হবে"),
  @("Remarks", "অতিরিক্ত প্রয়োজনীয় তথ্য"),
  @("Amount / Total", "টাকার পরিমাণ; total auto-calculated")
) @(2800, 6200))
Add (Note "Date এবং required field ফাঁকা থাকলে submit হবে না; সংশ্লিষ্ট field-এর নিচে error message দেখাবে। Amount শুধু সংখ্যায় লিখুন।")

Add (Paragraph "Supervisor নিজের Bill করলে" "Heading2" "4338CA" 27 -Bold)
Add (Paragraph "Supervisor New Bill page ব্যবহার করতে পারেন। প্রয়োজন হলে Forward to Supervisor (optional) থেকে upline supervisor নির্বাচন করবেন। কাউকে নির্বাচন না করলে system-এর hierarchy/rule অনুযায়ী bill auto-approve বা পরবর্তী stage-এ যাবে।")

Add (Paragraph "৫. Save Draft, Edit, Submit ও Delete" "Heading1" "312E81" 34 -Bold)
Add (Paragraph "Save Draft" "Heading2" "4338CA" 27 -Bold)
Add (Bullet "অসম্পূর্ণ কাজ নিরাপদে রেখে পরে শেষ করতে Save Draft চাপুন।")
Add (Bullet "Draft-এর status হবে DRAFT; এটি approval workflow-তে যায় না।")
Add (Bullet "Bills/Dashboard থেকে draft খুলে Edit চাপলে আগের তথ্য পাওয়া যাবে।")
Add (Paragraph "Edit" "Heading2" "4338CA" 27 -Bold)
Add (Step 1 "Bill row থেকে View খুলুন।")
Add (Step 2 "উপরে Edit button চাপুন।")
Add (Step 3 "তথ্য/row/amount সংশোধন করুন।")
Add (Step 4 "আরও পরে কাজ করতে Save Draft; approval-এ পাঠাতে Submit Bill চাপুন।")
Add (Paragraph "Submit Bill" "Heading2" "4338CA" 27 -Bold)
Add (Paragraph "Submit Bill চাপলে bill Supervisor-এর review queue-তে যায় এবং status SUBMITTED হয়। Submit করার আগে date, route, purpose, amount ও total আরেকবার যাচাই করুন।")
Add (Paragraph "Delete" "Heading2" "4338CA" 27 -Bold)
Add (Paragraph "শুধু DRAFT bill-এর detail page-এ Delete button থাকে। Delete করলে bill স্থায়ীভাবে মুছে যায়, তাই নিশ্চিত হয়ে ব্যবহার করুন। Submitted bill delete করা যায় না।")
Add (Note "Draft save করার অর্থ submit নয়। Supervisor যেন review করতে পারেন, শেষ কাজ হিসেবে অবশ্যই Submit Bill চাপুন।")

Add (Paragraph "৬. Bill দেখা, Search/Filter ও Status" "Heading1" "312E81" 34 -Bold)
Add (Paragraph "Bills page-এ search box দিয়ে Bill ID, employee, company, address, incident বা purpose খোঁজা যায়। Status dropdown দিয়ে নির্দিষ্ট status এবং permission থাকলে Employee filter দিয়ে নির্দিষ্ট user-এর bill দেখুন।")
Add (Table @(
  @("Status", "অর্থ / এখন কার কাছে"), @("DRAFT", "অসম্পূর্ণ; owner edit/submit করবেন"),
  @("SUBMITTED", "Supervisor-এর approval অপেক্ষায়"), @("APPROVED_BY_SUPERVISOR", "Accounts review করবে"),
  @("APPROVED_BY_ACCOUNTS", "Management review করবে"), @("APPROVED_BY_MANAGEMENT", "Accounts payment request পাঠাবে / confirmation অপেক্ষায়"),
  @("REJECTED_BY_SUPERVISOR", "Supervisor ফেরত দিয়েছেন; reason দেখে ঠিক করতে হবে"),
  @("REJECTED_BY_ACCOUNTS", "Accounts ফেরত দিয়েছে; reason দেখে ঠিক করতে হবে"),
  @("REJECTED_BY_MANAGEMENT", "Management ফেরত দিয়েছে; reason দেখে ঠিক করতে হবে"),
  @("PAID", "Employee টাকা পাওয়ার confirmation দিয়েছেন; workflow সম্পন্ন")
) @(3300, 5700))
Add (Paragraph "Bill Details-এর নিচের History অংশে status, comment/reason, সময় এবং action নেওয়া user দেখা যায়। সমস্যা বুঝতে History আগে দেখুন।")

Add (Paragraph "৭. Rejected Bill আবার Submit" "Heading1" "312E81" 34 -Bold)
Add (Step 1 "Rejected bill-এর Details খুলুন।")
Add (Step 2 "History থেকে rejection reason পড়ুন।")
Add (Step 3 "Edit চাপুন এবং reason অনুযায়ী ভুল date, purpose, route বা amount ঠিক করুন।")
Add (Step 4 "সব ঠিক হলে Submit Bill চাপুন। Bill আবার approval workflow-তে যাবে।")
Add (Note "Rejected bill শুধু Save Draft করলে reviewer-এর কাছে যাবে না; সংশোধনের পরে Submit Bill প্রয়োজন।")
Add (PageBreak)

# Approver roles
Add (Paragraph "৮. Supervisor-এর কাজ" "Heading1" "312E81" 34 -Bold)
Add (Paragraph "Dashboard-এর Pending Approvals বা Recent Team Bills থেকে bill খুলুন। Employee name/code, dates, route, purpose, amounts, total এবং attachment/remarks থাকলে সেগুলো যাচাই করুন।")
Add (Paragraph "Approve" "Heading2" "4338CA" 27 -Bold)
Add (Bullet "Forward to dropdown-এর Default — send to Accounts রেখে Approve চাপলে Accounts-এ যাবে।")
Add (Bullet "Submitted bill approve করার আগে responsible Supervisor প্রয়োজন হলে Edit করে সংশোধন করতে পারেন।")
Add (Paragraph "Forward" "Heading2" "4338CA" 27 -Bold)
Add (Bullet "Bill অন্য Supervisor-এর review প্রয়োজন হলে Forward to থেকে সেই Supervisor নির্বাচন করুন, তারপর Approve চাপুন।")
Add (Bullet "Forward করলে bill নির্বাচিত Supervisor-এর queue-তে থাকবে; Accounts-এ তখনই যাবে না।")
Add (Paragraph "Reject" "Heading2" "4338CA" 27 -Bold)
Add (Step 1 "Reason field-এ নির্দিষ্ট কারণ লিখুন—যেমন ‘Date ভুল’, ‘Purpose পরিষ্কার নয়’, ‘Amount যাচাই করুন’।")
Add (Step 2 "Reject চাপুন। Employee History-তে reason দেখে সংশোধন করতে পারবেন।")
Add (Note "Reject করার সময় Reason required। ‘Wrong’ বা ‘Check’ না লিখে কোন field কীভাবে ঠিক করতে হবে পরিষ্কার করুন।")

Add (Paragraph "৯. Accounts ও Follow-up User" "Heading1" "312E81" 34 -Bold)
Add (Paragraph "Accounts Dashboard-এ Pending Approval tab-এ Supervisor-approved bill এবং Pending Payment tab-এ Management-approved bill থাকে।")
Add (Paragraph "Accounts review" "Heading2" "4338CA" 27 -Bold)
Add (Step 1 "Pending Approval থেকে bill খুলে তথ্য, approval history ও total যাচাই করুন।")
Add (Step 2 "সঠিক হলে Approve (send to Management) চাপুন।")
Add (Step 3 "ভুল হলে Reason লিখে Reject চাপুন।")
Add (Paragraph "Follow-up role" "Heading2" "4338CA" 27 -Bold)
Add (Paragraph "Follow-up user Accounts-style dashboard থেকে pending অবস্থাগুলো পর্যবেক্ষণ করেন। কোন action দৃশ্যমান/অনুমোদিত হবে তা assigned permission ও current status-এর ওপর নির্ভর করে।")

Add (Paragraph "১০. Management-এর কাজ" "Heading1" "312E81" 34 -Bold)
Add (Step 1 "Pending Approval tab থেকে APPROVED_BY_ACCOUNTS bill খুলুন।")
Add (Step 2 "Bill details এবং Supervisor/Accounts history যাচাই করুন।")
Add (Step 3 "সঠিক হলে Approve (send to Accounts for payment) চাপুন।")
Add (Step 4 "ভুল হলে নির্দিষ্ট Reason লিখে Reject চাপুন।")
Add (Paragraph "Management approval-এর পরে status APPROVED_BY_MANAGEMENT হবে এবং Accounts payment process শুরু করতে পারবে।")

Add (Paragraph "১১. Payment Request ও টাকা পাওয়ার Confirmation" "Heading1" "312E81" 34 -Bold)
Add (Paragraph "Accounts-এর কাজ" "Heading2" "4338CA" 27 -Bold)
Add (Step 1 "Pending Payment থেকে Management-approved bill খুলুন।")
Add (Step 2 "Payment সম্পন্ন/প্রস্তুত হলে Send Request চাপুন।")
Add (Step 3 "Button Request Sent! দেখাবে এবং employee confirmation-এর অপেক্ষা করবে।")
Add (Paragraph "Employee/Supervisor claimant-এর কাজ" "Heading2" "4338CA" 27 -Bold)
Add (Step 1 "Payment request আসার পরে সংশ্লিষ্ট bill খুলুন।")
Add (Step 2 "টাকা বাস্তবে পাওয়ার পর I received the money চাপুন।")
Add (Step 3 "Confirmation dialog-এ নিশ্চিত করুন। Status PAID হবে।")
Add (Note "টাকা হাতে/অ্যাকাউন্টে না পাওয়া পর্যন্ত I received the money চাপবেন না। এই confirmation-ই bill-কে PAID করে।")

Add (Paragraph "১২. Reports, Excel Export ও Team" "Heading1" "312E81" 34 -Bold)
Add (Paragraph "Reports page-এ Total Bills, Paid, Rejected, status summary, approval funnel এবং monthly trend দেখা যায়। তথ্য user-এর role/scope অনুযায়ী দেখানো হয়।")
Add (Paragraph "Excel Export" "Heading2" "4338CA" 27 -Bold)
Add (Step 1 "Dashboard/section-এর প্রয়োজনীয় tab বা filter নির্বাচন করুন।")
Add (Step 2 "Export to Excel চাপুন। Current bill list একটি .xlsx file হিসেবে download হবে।")
Add (Paragraph "Team page" "Heading2" "4338CA" 27 -Bold)
Add (Bullet "Search by name, role filter এবং department filter দিয়ে user খুঁজুন।")
Add (Bullet "Authorized Management user Delete বা Reset Password action দেখতে পারেন।")
Add (Bullet "Delete user স্থায়ী action; reset password-এর পরে user-কে login করে password বদলাতে বলুন।")
Add (PageBreak)

Add (Paragraph "১৩. Settings, Profile ও Supervisor" "Heading1" "312E81" 34 -Bold)
Add (Step 1 "Settings খুলুন।")
Add (Step 2 "Full Name, Email Address, Designation এবং Department যাচাই/পরিবর্তন করুন।")
Add (Step 3 "Employee হলে Supervisor dropdown থেকে সঠিক Supervisor নির্বাচন করুন।")
Add (Step 4 "Save Changes চাপুন এবং success message দেখুন।")
Add (Paragraph "Supervisor বদলালে system supervisor-change request তৈরি করতে পারে। Pending থাকলে approval-এর অপেক্ষা করুন; Approved/Rejected status Settings-এ দেখা যাবে। Management pending request approve/reject করতে পারেন।")
Add (Note "ভুল Supervisor নির্বাচিত থাকলে bill সঠিক approver-এর কাছে নাও যেতে পারে। নতুন bill submit করার আগে Settings-এ Supervisor যাচাই করুন।")

Add (Paragraph "১৪. সম্পূর্ণ Workflow—এক নজরে" "Heading1" "312E81" 34 -Bold)
Add (Table @(
  @("ক্রম", "User/Role", "Action", "পরবর্তী Status"),
  @("১", "Employee", "Save Draft", "DRAFT"), @("২", "Employee", "Submit Bill", "SUBMITTED"),
  @("৩", "Supervisor", "Approve (Default)", "APPROVED_BY_SUPERVISOR"),
  @("৪", "Accounts", "Approve", "APPROVED_BY_ACCOUNTS"), @("৫", "Management", "Approve", "APPROVED_BY_MANAGEMENT"),
  @("৬", "Accounts", "Send Request", "Confirmation pending"), @("৭", "Employee", "I received the money", "PAID")
) @(900, 2200, 3300, 2600))
Add (Paragraph "যে কোনো review stage-এ Reject হলে bill REJECTED_BY_... status নিয়ে claimant-এর কাছে সংশোধনের জন্য ফিরে আসে। Claimant Edit করে আবার Submit Bill করবেন।")

Add (Paragraph "১৫. Troubleshooting ও সাধারণ ভুল" "Heading1" "312E81" 34 -Bold)
Add (Table @(
  @("সমস্যা", "সমাধান"),
  @("Submit হচ্ছে না", "লাল error message দেখুন; required date/field পূরণ করুন; amount সংখ্যায় দিন"),
  @("Bill Supervisor-এর কাছে যায়নি", "Settings-এ Supervisor ঠিক আছে কি না এবং bill সত্যিই Submit হয়েছে কি না দেখুন"),
  @("Edit button নেই", "শুধু Draft/Rejected owner বা responsible Supervisor-এর eligible submitted bill edit করা যায়"),
  @("Delete button নেই", "Delete শুধু Draft bill-এ পাওয়া যায়"),
  @("Approve/Reject নেই", "আপনার role, assigned supervisor এবং bill-এর current status action-এর সঙ্গে না মিললে button থাকে না"),
  @("Payment confirmation নেই", "Management approval এবং Accounts-এর Send Request—দুটিই আগে প্রয়োজন"),
  @("Search-এ পাওয়া যাচ্ছে না", "Filter All statuses করুন, search text clear করুন এবং role scope যাচাই করুন"),
  @("Login হচ্ছে না", "Email ছোট হাতের/সঠিকভাবে লিখুন, password যাচাই করুন; প্রয়োজন হলে authority-কে reset বলতে হবে"),
  @("Total ভুল", "প্রতি row-এর amount/advance যাচাই করুন এবং অতিরিক্ত/খালি row সরান")
) @(3000, 6000))

Add (Paragraph "Employee Quick Checklist" "Heading2" "4338CA" 27 -Bold)
@("সঠিক Supervisor selected", "Date ও route সঠিক", "Purpose পরিষ্কার", "Amount ও Total মিলেছে", "অপ্রয়োজনীয় row নেই", "Draft নয়—Submit Bill করা হয়েছে", "Rejected হলে History-এর reason অনুসারে সংশোধন", "টাকা পাওয়ার পরেই confirmation") | ForEach-Object { Add (Bullet ("☐ " + $_)) }
Add (Paragraph "Approver Quick Checklist" "Heading2" "4338CA" 27 -Bold)
@("Employee ও bill period যাচাই", "Route/purpose business-related", "Amount ও Total যাচাই", "আগের History/Reason পড়া", "Reject করলে নির্দিষ্ট reason", "Forward করলে সঠিক Supervisor", "Payment request শুধুমাত্র approval/payment প্রস্তুতির পরে") | ForEach-Object { Add (Bullet ("☐ " + $_)) }

Add (Paragraph "সহায়তা নেওয়ার সময় যে তথ্য দেবেন" "Heading2" "4338CA" 27 -Bold)
Add (Paragraph "Support/authority-কে সমস্যার কথা বলার সময় Bill ID, আপনার email/role, current status, কোন button চাপলে সমস্যা হয়েছে এবং error message/screenshot দিন। Password কখনও share করবেন না।")
Add (Note "এই manual application-এর বর্তমান workflow ও button labels অনুযায়ী তৈরি। ভবিষ্যতে screen/action পরিবর্তন হলে guide-টিও update করুন।" "শেষ কথা")

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>$($body.ToString())
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900" w:header="500" w:footer="500"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:cs="Nirmala UI"/><w:lang w:val="bn-BD"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/></w:pPr></w:style>
  <w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:color="CBD5E1"/></w:tblBorders></w:tblPr></w:style>
</w:styles>
"@

$numberingXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr></w:lvl><w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="○"/><w:lvlJc w:val="left"/></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>
"@

$rootRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>
"@

$docRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>
"@

$docPropsPath = Join-Path $stagePath "docProps"
New-Item -ItemType Directory -Path $docPropsPath | Out-Null
$coreXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>OfficeFlow User Guide Bangla</dc:title><dc:subject>Complete user manual</dc:subject><dc:creator>OfficeFlow</dc:creator><cp:keywords>OfficeFlow, Conveyance, Bill, User Guide</cp:keywords><dc:description>A-Z Bangla guide for all OfficeFlow roles</dc:description><dcterms:created xsi:type="dcterms:W3CDTF">2026-07-19T00:00:00Z</dcterms:created></cp:coreProperties>'
$appXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Office Word</Application><AppVersion>16.0000</AppVersion><Company>OfficeFlow</Company></Properties>'

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $stagePath "[Content_Types].xml"), $contentTypes, $utf8NoBom)
[IO.File]::WriteAllText((Join-Path $relsPath ".rels"), $rootRels, $utf8NoBom)
[IO.File]::WriteAllText((Join-Path $wordPath "document.xml"), $documentXml, $utf8NoBom)
[IO.File]::WriteAllText((Join-Path $wordPath "styles.xml"), $stylesXml, $utf8NoBom)
[IO.File]::WriteAllText((Join-Path $wordPath "numbering.xml"), $numberingXml, $utf8NoBom)
[IO.File]::WriteAllText((Join-Path $wordRelsPath "document.xml.rels"), $docRels, $utf8NoBom)
[IO.File]::WriteAllText((Join-Path $docPropsPath "core.xml"), $coreXml, $utf8NoBom)
[IO.File]::WriteAllText((Join-Path $docPropsPath "app.xml"), $appXml, $utf8NoBom)

Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path -LiteralPath $outputPath) { Remove-Item -LiteralPath $outputPath }
[System.IO.Compression.ZipFile]::CreateFromDirectory($stagePath, $outputPath)
Remove-Item -LiteralPath $stagePath -Recurse -Force
Write-Output $outputPath
