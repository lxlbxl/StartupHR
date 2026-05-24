<?php

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load PHPMailer manually since composer isn't used
require_once __DIR__ . '/../vendor/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../vendor/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/PHPMailer/src/SMTP.php';

class Mailer
{
    private $db;
    private $settings = [];

    public function __construct($db)
    {
        $this->db = $db;
        $this->loadSettings();
    }

    private function loadSettings()
    {
        $stmt = $this->db->query("SELECT setting_key, setting_value FROM settings");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $this->settings[$row['setting_key']] = $row['setting_value'];
        }
    }

    public function sendEmail($to, $subject, $body, $altBody = '')
    {
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mailMethod = $this->settings['mail_method'] ?? 'smtp';

            if ($mailMethod === 'smtp') {
                $mail->isSMTP();
                $mail->Host = $this->settings['smtp_host'] ?? '';
                $mail->SMTPAuth = true;
                $mail->Username = $this->settings['smtp_user'] ?? '';
                $mail->Password = $this->settings['smtp_pass'] ?? '';
                $mail->SMTPSecure = $this->settings['smtp_secure'] ?? 'tls';
                $mail->Port = $this->settings['smtp_port'] ?? 587;
            } else {
                $mail->isMail();
            }

            // Recipients
            $fromEmail = $this->settings['smtp_from_email'] ?? 'noreply@startuphr.com';
            $fromName = $this->settings['smtp_from_name'] ?? 'StartupHR';
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->AltBody = $altBody ?: strip_tags($body);

            return $mail->send();
        } catch (Exception $e) {
            error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }

    public function sendTemplateEmail($to, $templateName, $variables = [])
    {
        $stmt = $this->db->prepare("SELECT subject, body FROM email_templates WHERE name = ?");
        $stmt->execute([$templateName]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$template) {
            error_log("Email template not found: $templateName");
            return false;
        }

        $subject = $template['subject'];
        $body = $template['body'];

        foreach ($variables as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $subject = str_replace($placeholder, $value, $subject);
            $body = str_replace($placeholder, $value, $body);
        }

        return $this->sendEmail($to, $subject, $body);
    }
}
