; QASSIMZ Producer — Inno Setup script (per-user, no admin) with an animated 3D logo
#ifndef AppVer
  #define AppVer "1.1.0"
#endif
#define AppName "QASSIMZ Producer"
#define AppExe "QASSIMZ Producer.exe"
#define Repo "https://github.com/ahmedqassimtv-commits/qassimz-producer"

[Setup]
AppId=QASSIMZ.Producer
AppName={#AppName}
AppVersion={#AppVer}
AppPublisher=Ahmed Qassim — QASSIMZ
AppPublisherURL={#Repo}
AppSupportURL={#Repo}/issues
AppUpdatesURL={#Repo}/releases
DefaultDirName={localappdata}\Programs\QASSIMZ Producer
DefaultGroupName=QASSIMZ
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
CloseApplications=force
RestartApplications=no
OutputDir=..\dist
OutputBaseFilename=QASSIMZ-Producer-Setup-{#AppVer}
SetupIconFile=..\assets\logo.ico
UninstallDisplayIcon={app}\{#AppExe}
WizardStyle=modern
WizardImageFile=wizard.bmp
WizardSmallImageFile=wizard-small.bmp
WizardImageStretch=yes
InfoBeforeFile=..\docs\INSTRUCTIONS-AR.txt
LicenseFile=..\LICENSE
Compression=lzma2/ultra
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
#if FileExists(AddBackslash(SourcePath) + "Arabic.isl")
Name: "arabic"; MessagesFile: "Arabic.isl"
#endif
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; animation frames (only used by the installer itself)
Source: "anim\*.bmp"; DestDir: "{tmp}\anim"; Flags: dontcopy
Source: "..\dist\QASSIMZ Producer\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\docs\INSTRUCTIONS-AR.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExe}"
Name: "{group}\تعليمات الاستخدام"; Filename: "{app}\INSTRUCTIONS-AR.txt"
Name: "{group}\GitHub — QASSIMZ Producer"; Filename: "{#Repo}"
Name: "{group}\الدعم والإبلاغ عن مشكلة"; Filename: "{#Repo}/issues"
Name: "{group}\{cm:UninstallProgram,{#AppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExe}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExe}"; Description: "{cm:LaunchProgram,{#AppName}}"; Flags: nowait postinstall skipifsilent
Filename: "{#Repo}"; Description: "افتح صفحة البرنامج على GitHub"; Flags: postinstall shellexec skipifsilent unchecked
Filename: "{app}\{#AppExe}"; Flags: nowait; Check: WizardSilent

[Code]
const
  FRAMES = 36;
  FRAME_MS = 55;

var
  AnimTimer: LongWord;
  AnimFrame: Integer;
  AnimDir: String;

function SetTimer(hWnd: LongWord; nIDEvent, uElapse: LongWord; lpTimerFunc: LongWord): LongWord;
  external 'SetTimer@user32.dll stdcall';
function KillTimer(hWnd: LongWord; uIDEvent: LongWord): BOOL;
  external 'KillTimer@user32.dll stdcall';

function Pad2(N: Integer): String;
begin
  if N < 10 then Result := '0' + IntToStr(N) else Result := IntToStr(N);
end;

procedure AnimTick(Wnd: LongWord; Msg: LongWord; IdEvent: LongWord; Time: LongWord);
var
  S: String;
begin
  AnimFrame := (AnimFrame + 1) mod FRAMES;
  S := Pad2(AnimFrame);
  try
    if WizardForm.WizardBitmapImage.Visible then
      WizardForm.WizardBitmapImage.Bitmap.LoadFromFile(AnimDir + '\big' + S + '.bmp');
    if WizardForm.WizardBitmapImage2.Visible then
      WizardForm.WizardBitmapImage2.Bitmap.LoadFromFile(AnimDir + '\big' + S + '.bmp');
    if WizardForm.WizardSmallBitmapImage.Visible then
      WizardForm.WizardSmallBitmapImage.Bitmap.LoadFromFile(AnimDir + '\small' + S + '.bmp');
  except
  end;
end;

procedure InitializeWizard;
begin
  try
    ExtractTemporaryFiles('{tmp}\anim\*.bmp');
    AnimDir := ExpandConstant('{tmp}\anim');
    AnimFrame := 0;
    AnimTimer := SetTimer(0, 0, FRAME_MS, CreateCallback(@AnimTick));
  except
    AnimTimer := 0;
  end;
end;

procedure DeinitializeSetup;
begin
  if AnimTimer <> 0 then KillTimer(0, AnimTimer);
end;
