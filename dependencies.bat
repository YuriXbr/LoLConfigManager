@echo off
echo.
echo Instalando Dependencias do ConfigManager.

NET SESSION >NUL 2>&1
IF %ERRORLEVEL% EQU 0 (
    
set "dir=%~dp0"

cd %dir%
npm i

echo dependencias Instaladas
pause
exit


) ELSE (
    :: Não está sendo executado como administrador, solicita permissões de administrador
    echo Por favor, de permissao de administrador para que as dependencias do programa sejam instaladas corretamente
    echo (Por motivos de segurança, você não verá a senha sendo digitada)
    set "script=%~0"
    %windir%\system32\runas.exe /user:%USERDOMAIN%\%USERNAME% "%script%"
    exit /b
)

exit
