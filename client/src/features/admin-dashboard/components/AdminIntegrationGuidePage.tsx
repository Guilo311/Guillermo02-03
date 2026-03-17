import AdminLayout from "@/components/AdminLayout";
import { MotionPageShell } from "@/animation/components/MotionPageShell";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getAdminIntegrationCommonCopy,
  translateAdminDashboardText,
} from "@/lib/adminUiLocale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type GuideSection = {
  title: string;
  items: string[];
};

type IntegrationFormField = {
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "url" | "password";
};

type AdminIntegrationGuidePageProps = {
  title: string;
  subtitle: string;
  docsHref: string;
  docsLabel: string;
  endpoint: string;
  cadence: string;
  authModel: string;
  freeStack: string[];
  logicSteps: string[];
  fieldMapping: string[];
  codeSample: string;
  formStorageKey: string;
  formFields: IntegrationFormField[];
  setupSteps: string[];
};

const googleCloudPrerequisites = [
  "Criar um projeto no Google Cloud Console, por exemplo: glx-integrations.",
  "Em APIs & Services -> Library, habilitar Google Sheets API, Google Calendar API, Google Drive API e Google Forms API quando necessario.",
  "Tudo parte do mesmo lugar: console.cloud.google.com, sem precisar criar uma conta tecnica separada por integracao.",
];

const authOptions = [
  "Service Account: recomendado para servidor/backend sem interacao humana. Crie a credencial, baixe o JSON e compartilhe a planilha ou calendario com o e-mail da service account.",
  "OAuth 2.0: recomendado quando o usuario precisa autorizar acesso aos proprios dados. Configure OAuth Consent Screen, gere client_id, client_secret e refresh_token.",
];

const quotaItems = [
  "Google Sheets API: 300 leituras por minuto por projeto, sem custo adicional.",
  "Google Calendar API: ate 1.000.000 de requests por dia na camada gratuita.",
  "Google Forms e Drive: uso sem custo adicional dentro das quotas padrao do Google.",
  "Para o volume atual da GLX Partners, a operacao cabe folgadamente na faixa gratuita.",
];

const pythonQuickstart = `from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
]

creds = service_account.Credentials.from_service_account_file(
    "service_account.json",
    scopes=SCOPES,
)

sheets = build("sheets", "v4", credentials=creds)
sheet_result = sheets.spreadsheets().values().get(
    spreadsheetId="SEU_SPREADSHEET_ID",
    range="Sheet1!A1:D10",
).execute()

calendar = build("calendar", "v3", credentials=creds)
events = calendar.events().list(calendarId="primary").execute()`;

const fastApiRouterSample = `from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel

from .client import GoogleClient, get_google_client
from .sheets import SheetsService
from .calendar import CalendarService
from .forms import FormsService
from .drive import DriveService

router = APIRouter(prefix="/google", tags=["Google Integrations"])

def get_sheets(client: GoogleClient = Depends(get_google_client)) -> SheetsService:
    return SheetsService(client)

def get_calendar(client: GoogleClient = Depends(get_google_client)) -> CalendarService:
    return CalendarService(client)

def get_forms(client: GoogleClient = Depends(get_google_client)) -> FormsService:
    return FormsService(client)

def get_drive(client: GoogleClient = Depends(get_google_client)) -> DriveService:
    return DriveService(client)

class SheetWriteBody(BaseModel):
    range_: str
    values: list[list[Any]]
    input_option: str = "USER_ENTERED"

class EventCreateBody(BaseModel):
    title: str
    start: datetime
    end: datetime
    description: Optional[str] = None
    location: Optional[str] = None
    attendees: Optional[list[str]] = None
    color_id: Optional[str] = None

@router.get("/sheets/{spreadsheet_id}/read")
def read_sheet(
    spreadsheet_id: str,
    range_: str = Query(..., alias="range"),
    as_dicts: bool = False,
    svc: SheetsService = Depends(get_sheets),
):
    if as_dicts:
        return svc.read_as_dicts(spreadsheet_id, range_)
    return svc.read(spreadsheet_id, range_)

@router.post("/sheets/{spreadsheet_id}/append")
def append_sheet(
    spreadsheet_id: str,
    body: SheetWriteBody,
    svc: SheetsService = Depends(get_sheets),
):
    return svc.append(spreadsheet_id, body.range_, body.values, body.input_option)

@router.get("/calendar/{calendar_id}/events")
def list_events(
    calendar_id: str,
    days_ahead: int = 30,
    max_results: int = 50,
    query: Optional[str] = None,
    svc: CalendarService = Depends(get_calendar),
):
    return svc.list_events(
        calendar_id=calendar_id,
        days_ahead=days_ahead,
        max_results=max_results,
        query=query,
    )

@router.post("/calendar/{calendar_id}/events")
def create_event(
    calendar_id: str,
    body: EventCreateBody,
    svc: CalendarService = Depends(get_calendar),
):
    return svc.create_event(
        calendar_id=calendar_id,
        title=body.title,
        start=body.start,
        end=body.end,
        description=body.description,
        location=body.location,
        attendees=body.attendees,
        color_id=body.color_id,
    )

@router.get("/forms/{form_id}/responses")
def get_responses(
    form_id: str,
    as_dicts: bool = True,
    svc: FormsService = Depends(get_forms),
):
    if as_dicts:
        return svc.get_responses_as_dicts(form_id)
    return svc.get_responses(form_id)

@router.get("/drive/files")
def list_files(
    folder_id: Optional[str] = None,
    name_contains: Optional[str] = None,
    max_results: int = 50,
    svc: DriveService = Depends(get_drive),
):
    return svc.list_files(
        folder_id=folder_id,
        name_contains=name_contains,
        max_results=max_results,
    )`;

export function AdminIntegrationGuidePage({
  title,
  subtitle,
  docsHref,
  docsLabel,
  endpoint,
  cadence,
  authModel,
  freeStack,
  logicSteps,
  fieldMapping,
  codeSample,
  formStorageKey,
  formFields,
  setupSteps,
}: AdminIntegrationGuidePageProps) {
  const { language } = useLanguage();
  const copy = getAdminIntegrationCommonCopy(language);
  const t = (value: string) => translateAdminDashboardText(value, language);
  const sections: GuideSection[] = [
    { title: copy.freeRecommendedStack, items: freeStack.map(t) },
    { title: copy.ingestionLogic, items: logicSteps.map(t) },
    { title: copy.dashboardFields, items: fieldMapping.map(t) },
  ];
  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(formFields.map((field) => [field.name, ""])),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(formStorageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Record<string, string>;
      setFormValues((current) => ({ ...current, ...parsed }));
    } catch {
      window.localStorage.removeItem(formStorageKey);
    }
  }, [formStorageKey]);

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSaveForm = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(formStorageKey, JSON.stringify(formValues));
    toast.success(copy.localConfigSaved);
  };

  return (
    <AdminLayout>
      <MotionPageShell className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">{t(title)}</h1>
            <p className="text-[#6b7280]">{t(subtitle)}</p>
          </div>
          <a href={docsHref} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2 rounded-full border-[#111827] bg-white text-[#111827] hover:bg-[#f8fafc]">
              <ExternalLink className="h-4 w-4" />
              {docsLabel}
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
            <CardHeader>
              <CardTitle className="text-base text-[#111827]">{copy.suggestedInternalEndpoint}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#475467]">{endpoint}</CardContent>
          </Card>
          <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
            <CardHeader>
              <CardTitle className="text-base text-[#111827]">{copy.cadence}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#475467]">{t(cadence)}</CardContent>
          </Card>
          <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
            <CardHeader>
              <CardTitle className="text-base text-[#111827]">{copy.authentication}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#475467]">{t(authModel)}</CardContent>
          </Card>
        </div>

        <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
          <CardHeader>
            <CardTitle className="text-[1.05rem] text-[#111827]">{copy.connectionForm}</CardTitle>
            <CardDescription className="text-[#6b7280]">
              {copy.connectionFormDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`${formStorageKey}-${field.name}`} className="text-[#111827]">
                  {t(field.label)}
                </Label>
                <Input
                  id={`${formStorageKey}-${field.name}`}
                  type={field.type ?? "text"}
                  value={formValues[field.name] ?? ""}
                  onChange={(event) => handleFieldChange(field.name, event.target.value)}
                  placeholder={t(field.placeholder)}
                  className="h-12 rounded-2xl border-[#d8e2ee] bg-white text-[#0f172a] placeholder:text-[#98a2b3]"
                />
              </div>
            ))}
            <div className="md:col-span-2 flex justify-end">
              <Button type="button" onClick={handleSaveForm} className="rounded-full bg-[#ff7a1a] px-6 text-white hover:bg-[#f06a09]">
                {copy.saveConfiguration}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
          <CardHeader>
            <CardTitle className="text-[1.05rem] text-[#111827]">{copy.stepByStep}</CardTitle>
            <CardDescription className="text-[#6b7280]">
              {copy.setupStepsDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {setupSteps.map((step, index) => (
              <div key={step} className="rounded-[18px] border border-[#edf2f7] bg-[#fbfcfe] px-4 py-3 text-sm leading-6 text-[#475467]">
                <strong className="mr-2 text-[#111827]">{String(index + 1).padStart(2, "0")}.</strong>
                {t(step)}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
            <CardHeader>
              <CardTitle className="text-[1.05rem] text-[#111827]">{copy.prerequisitesTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {googleCloudPrerequisites.map((item) => (
                <div key={item} className="rounded-[18px] border border-[#edf2f7] bg-[#fbfcfe] px-4 py-3 text-sm leading-6 text-[#475467]">
                  {t(item)}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
            <CardHeader>
              <CardTitle className="text-[1.05rem] text-[#111827]">{copy.authOptionsTitle}</CardTitle>
              <CardDescription className="text-[#6b7280]">
                {copy.authOptionsDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {authOptions.map((item) => (
                <div key={item} className="rounded-[18px] border border-[#edf2f7] bg-[#fbfcfe] px-4 py-3 text-sm leading-6 text-[#475467]">
                  {t(item)}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
            <CardHeader>
              <CardTitle className="text-[1.05rem] text-[#111827]">{copy.freeQuotasTitle}</CardTitle>
              <CardDescription className="text-[#6b7280]">
                {copy.freeQuotasDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quotaItems.map((item) => (
                <div key={item} className="rounded-[18px] border border-[#edf2f7] bg-[#fbfcfe] px-4 py-3 text-sm leading-6 text-[#475467]">
                  {t(item)}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.title} className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
              <CardHeader>
                <CardTitle className="text-[1.05rem] text-[#111827]">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.map((item) => (
                  <div key={item} className="rounded-[18px] border border-[#edf2f7] bg-[#fbfcfe] px-4 py-3 text-sm leading-6 text-[#475467]">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
          <CardHeader>
            <CardTitle className="text-[1.05rem] text-[#111827]">{copy.pythonQuickstart}</CardTitle>
            <CardDescription className="text-[#6b7280]">
              {copy.pythonQuickstartDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-[22px] border border-[#e8edf5] bg-[#0f172a] p-5 text-xs leading-6 text-[#e2e8f0]">
              <code>{pythonQuickstart}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
          <CardHeader>
            <CardTitle className="text-[1.05rem] text-[#111827]">{copy.appsScriptBase}</CardTitle>
            <CardDescription className="text-[#6b7280]">
              {copy.appsScriptBaseDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-[22px] border border-[#e8edf5] bg-[#0f172a] p-5 text-xs leading-6 text-[#e2e8f0]">
              <code>{codeSample}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="border-[#e4e9f1] bg-white shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
          <CardHeader>
            <CardTitle className="text-[1.05rem] text-[#111827]">{copy.fastApiRouter}</CardTitle>
            <CardDescription className="text-[#6b7280]">
              {copy.fastApiRouterDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-[22px] border border-[#e8edf5] bg-[#0f172a] p-5 text-xs leading-6 text-[#e2e8f0]">
              <code>{fastApiRouterSample}</code>
            </pre>
          </CardContent>
        </Card>
      </MotionPageShell>
    </AdminLayout>
  );
}
